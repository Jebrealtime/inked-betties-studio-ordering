import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// ⭐ UPDATED SETTINGS SCHEMA — now includes checklist + restrictedItems
const SettingsSchema = new mongoose.Schema({
  companySpendingLimit: { type: Number, default: 0 },
  studioName: { type: String, default: "Inked Betties" },
  restrictedItems: { type: [String], default: [] },   // ⭐ NEW
  checklist: { type: [String], default: [] }          // ⭐ NEW
});

const Settings = mongoose.model("Settings", SettingsSchema);

// ⭐ GET ALL SETTINGS
router.get("/", async (req, res) => {
  const settings = await Settings.findOne() || await Settings.create({});
  res.json(settings);
});

// ⭐ UPDATE ALL SETTINGS (studio name, spending limit, restricted items, checklist)
router.put("/", async (req, res) => {
  const settings = await Settings.findOne() || await Settings.create({});
  const updated = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true });
  res.json(updated);
});

// ⭐ GET CHECKLIST ONLY
router.get("/checklist", async (req, res) => {
  const settings = await Settings.findOne() || await Settings.create({});
  res.json(settings.checklist || []);
});

// ⭐ UPDATE CHECKLIST ONLY
router.put("/checklist", async (req, res) => {
  const { checklist } = req.body;

  const settings = await Settings.findOne() || await Settings.create({});
  const updated = await Settings.findByIdAndUpdate(
    settings._id,
    { checklist },
    { new: true }
  );

  res.json(updated.checklist);
});

// ⭐ GET RESTRICTED ITEMS ONLY
router.get("/restricted", async (req, res) => {
  const settings = await Settings.findOne() || await Settings.create({});
  res.json(settings.restrictedItems || []);
});

// ⭐ UPDATE RESTRICTED ITEMS ONLY
router.put("/restricted", async (req, res) => {
  const { restrictedItems } = req.body;

  const settings = await Settings.findOne() || await Settings.create({});
  const updated = await Settings.findByIdAndUpdate(
    settings._id,
    { restrictedItems },
    { new: true }
  );

  res.json(updated.restrictedItems);
});

export default router;
