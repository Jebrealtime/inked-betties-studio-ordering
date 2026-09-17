import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Artist Schema
const ArtistSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // hashed later
  role: { type: String, default: "artist" },
  spendingLimit: { type: Number, default: 0 },
  restrictedItems: { type: [String], default: [] },
  favorites: { type: [String], default: [] },

  // ⭐ NEW FIELDS FOR CHECKLIST SYSTEM
  checklistProgress: { type: Object, default: {} },
  lastChecklistReset: { type: String, default: "" }
});

const Artist = mongoose.model("Artist", ArtistSchema);

// ⭐ GET ALL ARTISTS (needed for Artist Settings)
router.get("/", async (req, res) => {
  try {
    const artists = await Artist.find();
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

// ⭐ OWNER INVITES AN ARTIST (creates artist account)
router.post("/invite", async (req, res) => {
  try {
    const { name, email } = req.body;

    const artist = await Artist.create({
      name,
      email,
      password: "temp123", // temporary password
      role: "artist",
      spendingLimit: 0,
      restrictedItems: [],
      favorites: []
    });

    res.json({ status: "ok", artist });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Create artist account (manual register)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        status: "error",
        message: "Name, email, password, and role are required."
      });
    }

    const allowedRoles = ["solo", "owner"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Role must be 'solo' or 'owner'."
      });
    }

    const existing = await Artist.findOne({ email });
    if (existing) {
      return res.status(409).json({
        status: "error",
        message: "An account with that email already exists."
      });
    }

    const artist = await Artist.create({
      name,
      email,
      password, // ⚠️ still plaintext — flagged earlier, separate fix
      role
    });

    res.json({ status: "ok", artist });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const artist = await Artist.findOne({ email });
  if (!artist) return res.status(404).json({ status: "error", message: "User not found" });

  if (artist.password !== password)
    return res.status(401).json({ status: "error", message: "Invalid password" });

  res.json({ status: "ok", artist });
});

// Update spending limit
router.put("/:id/limit", async (req, res) => {
  const { spendingLimit } = req.body;
  const updated = await Artist.findByIdAndUpdate(req.params.id, { spendingLimit }, { new: true });
  res.json(updated);
});

// Update restricted items
router.put("/:id/restricted", async (req, res) => {
  const { restrictedItems } = req.body;
  const updated = await Artist.findByIdAndUpdate(req.params.id, { restrictedItems }, { new: true });
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

// ⭐⭐⭐ CREATE TEST SOLO ARTIST (CLICKABLE GET ROUTE)
router.get("/create-test-solo", async (req, res) => {
  try {
    const artist = await Artist.create({
      name: "Solo Test Artist",
      email: "solo@test.com",
      password: "123",
      role: "artist",
      spendingLimit: 200,
      restrictedItems: ["Tattoo Machine"],
      favorites: ["Black Gloves", "Green Soap", "Clip Cord"],
      checklistProgress: {
        "Clean Station": true,
        "Prep Needles": false
      },
      lastChecklistReset: new Date().toISOString().split("T")[0]
    });

    res.json({ status: "ok", artist });
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