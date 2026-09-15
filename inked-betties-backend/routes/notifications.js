import express from "express";
import mongoose from "mongoose";

const router = express.Router();

const NotificationSchema = new mongoose.Schema({
  artistEmail: String,
  reasons: Array,
  date: String
});

const Notification = mongoose.model("Notification", NotificationSchema);

// Get all notifications
router.get("/", async (req, res) => {
  const notes = await Notification.find().sort({ date: -1 });
  res.json(notes);
});

// Add notification
router.post("/", async (req, res) => {
  const saved = await Notification.create(req.body);
  res.json(saved);
});

export default router;
