const Channel = require("../models/Channel");
const path = require("path");
const fs = require("fs");

// Helper to remove old file
function removeFileIfExists(filepath) {
  if (!filepath) return;
  const full = path.join(__dirname, "..", "public", filepath.replace(/^\//, ""));
  if (fs.existsSync(full)) {
    try { fs.unlinkSync(full); } catch (e) { /* ignore */ }
  }
}

exports.getChannels = async (req, res) => {
  try {
    const channels = await Channel.find().sort({ createdAt: -1 });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ error: "Channel not found" });
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createChannel = async (req, res) => {
  const { name, videoUrl, language, category, drm, logoUrl } = req.body;
  const logoPath = req.file ? `/uploads/${req.file.filename}` : (logoUrl || null);

  if (!name || !videoUrl || !language || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const channel = new Channel({
      name,
      videoUrl,
      logo: logoPath,
      language,
      category,
      drm: drm || "CLEARKEY"
    });
    await channel.save();
    res.json({ message: "Channel created", id: channel._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateChannel = async (req, res) => {
  const { id } = req.params;
  const { name, videoUrl, language, category, drm, logoUrl } = req.body;
  const file = req.file;

  try {
    const channel = await Channel.findById(id);
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    if (name !== undefined) channel.name = name;
    if (videoUrl !== undefined) channel.videoUrl = videoUrl;
    if (language !== undefined) channel.language = language;
    if (category !== undefined) channel.category = category;
    if (drm !== undefined) channel.drm = drm;

    if (file) {
      if (channel.logo && channel.logo.startsWith("/uploads/")) {
        removeFileIfExists(channel.logo);
      }
      channel.logo = `/uploads/${file.filename}`;
    } else if (logoUrl !== undefined) {
      channel.logo = logoUrl || null;
    }

    await channel.save();
    res.json({ message: "Channel updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    if (channel.logo && channel.logo.startsWith("/uploads/")) {
      removeFileIfExists(channel.logo);
    }

    await Channel.findByIdAndDelete(req.params.id);
    res.json({ message: "Channel deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
