const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Ad = require("../models/Ad");

// ── Multer setup: save ad images to public/uploads/ads/ ──
const adsUploadDir = path.join(__dirname, "..", "public", "uploads", "ads");
if (!fs.existsSync(adsUploadDir)) fs.mkdirSync(adsUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, adsUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `ad_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// POST /api/ads/upload — upload an image, returns its hosted URL
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const host = req.headers.host || "localhost:4000";
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const imageUrl = `${protocol}://${host}/uploads/ads/${req.file.filename}`;
  res.json({ imageUrl });
});

// GET all ads (web user fetches active one)
router.get("/", async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ads" });
  }
});

// GET up to 3 active ads (used by web frontend carousel)
router.get("/active", async (req, res) => {
  try {
    const ads = await Ad.find({ isActive: true }).sort({ createdAt: -1 }).limit(3);
    res.json(ads);   // returns array of up to 3
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch active ads" });
  }
});

// POST create new ad (admin)
router.post("/", async (req, res) => {
  try {
    const { imageUrl, title, subtitle, slogan, sponsorLabel, isActive } = req.body;
    if (!imageUrl || !title) {
      return res.status(400).json({ message: "imageUrl and title are required" });
    }
    const ad = new Ad({ imageUrl, title, subtitle, slogan, sponsorLabel, isActive });
    await ad.save();
    res.status(201).json(ad);
  } catch (err) {
    res.status(500).json({ message: "Failed to create ad" });
  }
});

// PATCH toggle active/inactive (admin)
router.patch("/:id/toggle", async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });
    ad.isActive = !ad.isActive;
    await ad.save();
    res.json(ad);
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle ad" });
  }
});

// DELETE ad (admin)
router.delete("/:id", async (req, res) => {
  try {
    await Ad.findByIdAndDelete(req.params.id);
    res.json({ message: "Ad deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete ad" });
  }
});

module.exports = router;
