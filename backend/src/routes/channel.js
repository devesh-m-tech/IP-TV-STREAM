// src/routes/channel.js
const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channelController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure uploads dir
const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Public routes
router.get("/", channelController.getChannels);
router.get("/next-number", channelController.getNextChannelNumber);
router.get("/:id", channelController.getChannel);

// Admin routes (you should protect these with verifyAdmin middleware in production)
router.post("/", upload.single("logoFile"), channelController.createChannel);
router.put("/:id", upload.single("logoFile"), channelController.updateChannel);
router.delete("/:id", channelController.deleteChannel);

module.exports = router;
