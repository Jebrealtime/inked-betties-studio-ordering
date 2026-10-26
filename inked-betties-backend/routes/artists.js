import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";

const router = express.Router();

// ======================================================
// PASSWORD HASHING (Node's built-in scrypt — no extra package)
// Stored format: "scrypt$<salt hex>$<hash hex>"
// ======================================================
export function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(plain), salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function isHashed(stored) {
  return typeof stored === "string" && stored.startsWith("scrypt$");
}

export function checkPassword(plain, stored) {
  if (!stored) return false;
  if (!isHashed(stored)) {
    // Older accounts were saved before hashing existed; compare once so they
    // can still log in, then the login route upgrades them to a hash.
    const a = Buffer.from(String(plain));
    const b = Buffer.from(String(stored));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  const [, salt, hash] = stored.split("$");
  const test = crypto.scryptSync(String(plain), salt, 64);
  const real = Buffer.from(hash, "hex");
  return real.length === test.length && crypto.timingSafeEqual(real, test);
}

// Artist Schema
const ArtistSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true }, // ⭐ prevents duplicate accounts at the DB level
  password: String, // stored as a scrypt hash (see hashPassword)
  role: { type: String, default: "artist" },

  // ⭐ Which studio owner this artist works under (null for solo/owner accounts)
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", default: null },

  spendingLimit: { type: Number, default: 0 },
  restrictedItems: { type: [String], default: [] },
  favorites: { type: [String], default: [] },

  // ⭐ NEW FIELDS FOR CHECKLIST SYSTEM
  checklistProgress: { type: Object, default: {} },
  lastChecklistReset: { type: String, default: "" }
});

// ⭐ Never send a password (or its hash) back to the browser, from any route.
ArtistSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

const Artist = mongoose.model("Artist", ArtistSchema);

// ⭐ GET ARTISTS (needed for Artist Settings / Studio Management)
// Pass ?ownerId=<owner's id> to get only that studio's artists.
router.get("/", async (req, res) => {
  try {
    // Only list a specific studio's artists — never everyone in the database.
    if (!req.query.ownerId || !mongoose.isValidObjectId(req.query.ownerId)) {
      return res.json([]);
    }
    const artists = await Artist.find({ role: "artist", ownerId: req.query.ownerId });
    res.json(artists);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ⭐ GET SINGLE ARTIST BY ID (needed for dashboard role check)
router.get("/:id", async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ status: "error", message: "Artist not found" });
    }
    res.json(artist);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ⭐ LOOK UP A STUDIO FROM AN INVITE LINK (public: only the studio's name)
router.get("/invite/:ownerId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.ownerId)) {
      return res.status(404).json({ status: "error", message: "Invite link not found." });
    }
    const owner = await Artist.findById(req.params.ownerId);
    if (!owner || owner.role !== "owner") {
      return res.status(404).json({ status: "error", message: "Invite link not found." });
    }
    res.json({ status: "ok", ownerId: owner._id, ownerName: owner.name });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ⭐ OWNER ADDS AN ARTIST BY NAME + EMAIL (creates artist account in their studio)
router.post("/invite", async (req, res) => {
  try {
    const { name, email, ownerId } = req.body;

    if (!name || !email || !mongoose.isValidObjectId(ownerId)) {
      return res.status(400).json({ status: "error", message: "Name, email and studio are required." });
    }
    const owner = await Artist.findById(ownerId);
    if (!owner || owner.role !== "owner") {
      return res.status(403).json({ status: "error", message: "Only studio owners can add artists." });
    }

    // The artist sets their own password through the invite link; this random
    // one just fills the field and is never shown to anyone.
    const artist = await Artist.create({
      name,
      email: email.trim().toLowerCase(), // ⭐ same normalization as register/login
      password: hashPassword(crypto.randomBytes(24).toString("hex")),
      role: "artist",
      ownerId: owner._id,
      spendingLimit: 0,
      restrictedItems: [],
      favorites: []
    });

    res.json({ status: "ok", artist });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ status: "error", message: "An account with that email already exists." });
    }
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Create account (manual register, or an artist joining through an invite link)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, ownerId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        status: "error",
        message: "Name, email, password, and role are required."
      });
    }

    const allowedRoles = ["solo", "owner", "artist"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Role must be 'solo', 'owner' or 'artist'."
      });
    }

    // ⭐ Artists can only register through a real studio owner's invite link.
    let studioOwnerId = null;
    if (role === "artist") {
      const owner = mongoose.isValidObjectId(ownerId) ? await Artist.findById(ownerId) : null;
      if (!owner || owner.role !== "owner") {
        return res.status(400).json({
          status: "error",
          message: "This invite link isn't valid. Ask your studio owner for a new one."
        });
      }
      studioOwnerId = owner._id;
    }

    // ⭐ Normalize casing so "Morgan@X.com" and "morgan@x.com" are the same
    // account — logins shouldn't ever fail over capitalization.
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await Artist.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        status: "error",
        message: "An account with that email already exists."
      });
    }

    const artist = await Artist.create({
      name,
      email: normalizedEmail,
      password: hashPassword(password),
      role,
      ownerId: studioOwnerId
    });

    res.json({ status: "ok", artist });
  } catch (err) {
    // ⭐ Two rapid clicks/submissions can both pass the findOne check above
    // before either finishes creating the account — this is MongoDB's own
    // duplicate-key error catching that race, so it still shows a clean
    // message instead of a raw server error.
    if (err.code === 11000) {
      return res.status(409).json({
        status: "error",
        message: "An account with that email already exists."
      });
    }
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // ⭐ Same normalization as registration — login is now case-insensitive.
  const normalizedEmail = (email || "").trim().toLowerCase();

  try {
    const artist = await Artist.findOne({ email: normalizedEmail });

    // ⭐ Same message either way, so nobody can use login to test which emails have accounts.
    if (!artist || !checkPassword(password, artist.password)) {
      return res.status(401).json({ status: "error", message: "Wrong email or password" });
    }

    // ⭐ Older accounts saved before hashing: upgrade them now that we know the password.
    if (!isHashed(artist.password)) {
      artist.password = hashPassword(password);
      await artist.save();
    }

    res.json({ status: "ok", artist });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Update spending limit
router.put("/:id/limit", async (req, res) => {
  const { spendingLimit } = req.body;
  const updated = await Artist.findByIdAndUpdate(req.params.id, { spendingLimit }, { returnDocument: "after" });
  res.json(updated);
});

// Update restricted items
router.put("/:id/restricted", async (req, res) => {
  const { restrictedItems } = req.body;
  const updated = await Artist.findByIdAndUpdate(req.params.id, { restrictedItems }, { returnDocument: "after" });
  res.json(updated);
});

// ⭐ DAILY RESET CHECKLIST
router.post("/:id/reset-checklist", async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);

    artist.checklistProgress = {}; // clear all checks
    artist.lastChecklistReset = new Date().toISOString().split("T")[0];

    await artist.save();

    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ⭐ ARTIST CHECKS OFF AN ITEM → SAVE + NOTIFY OWNER
router.post("/:id/checklist", async (req, res) => {
  try {
    const { item, completed } = req.body;

    const artist = await Artist.findById(req.params.id);

    artist.checklistProgress[item] = completed;
    await artist.save();

    const Notification = mongoose.model("Notification");
    await Notification.create({
      artistId: artist._id,
      artistEmail: artist.email,
      item,
      completed,
      date: new Date().toISOString()
    });

    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ⭐ OWNER DELETES AN ARTIST → SWITCH TO SOLO MODE
router.delete("/:id", async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);

    if (!artist) {
      return res.status(404).json({ status: "error", message: "Artist not found" });
    }

    // ⭐ Instead of deleting the account, convert them to SOLO mode
    artist.role = "solo";
    artist.ownerId = null;
    artist.spendingLimit = 0;
    artist.restrictedItems = [];
    artist.favorites = [];
    artist.checklistProgress = {};
    artist.lastChecklistReset = "";

    await artist.save();

    res.json({ status: "ok", message: "Artist switched to solo mode", artist });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;