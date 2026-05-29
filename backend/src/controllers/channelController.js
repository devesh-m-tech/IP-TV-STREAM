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

/**
 * Find the smallest available channel number starting from 101.
 * This fills gaps left by deleted channels.
 */
async function getNextChannelNumber() {
  const channels = await Channel.find({ channelNumber: { $exists: true, $ne: null } })
    .select("channelNumber")
    .sort({ channelNumber: 1 });

  const usedNums = new Set(channels.map(c => c.channelNumber));
  let next = 101;
  while (usedNums.has(next)) {
    next++;
  }
  return next;
}

/**
 * GET /channels/next-number
 * Returns the next available channel number for the admin UI to pre-fill.
 */
exports.getNextChannelNumber = async (req, res) => {
  try {
    const num = await getNextChannelNumber();
    res.json({ nextNumber: num });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChannels = async (req, res) => {
  try {
    // Sort by channelNumber ascending; channels without a number go to the end
    const channels = await Channel.find().sort({ channelNumber: 1, createdAt: -1 });
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
  const { name, videoUrl, language, category, drm, logoUrl, status, channelNumber } = req.body;
  const logoPath = req.file ? `/uploads/${req.file.filename}` : (logoUrl || null);

  if (!name || !videoUrl || !language || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let assignedNumber;

    if (channelNumber !== undefined && channelNumber !== null && channelNumber !== "") {
      // Admin provided a number — check uniqueness
      const parsed = parseInt(channelNumber, 10);
      if (isNaN(parsed) || parsed < 1) {
        return res.status(400).json({ error: "Channel number must be a positive integer" });
      }
      const exists = await Channel.findOne({ channelNumber: parsed });
      if (exists) {
        return res.status(409).json({
          error: `Channel number ${parsed} is already taken by "${exists.name}". Please choose a different number.`
        });
      }
      assignedNumber = parsed;
    } else {
      // Auto-assign the next available (fills deleted gaps)
      assignedNumber = await getNextChannelNumber();
    }

    const channel = new Channel({
      channelNumber: assignedNumber,
      name,
      videoUrl,
      logo: logoPath,
      language,
      category,
      drm: drm || "CLEARKEY",
      status: status || "Active"
    });
    await channel.save();
    res.json({ message: "Channel created", id: channel._id, channelNumber: assignedNumber });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key on channelNumber
      return res.status(409).json({ error: "Channel number already exists. Please choose a different number." });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.updateChannel = async (req, res) => {
  const { id } = req.params;
  const { name, videoUrl, language, category, drm, logoUrl, status, channelNumber } = req.body;
  const file = req.file;

  try {
    const channel = await Channel.findById(id);
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    // Validate channelNumber uniqueness if being changed
    if (channelNumber !== undefined && channelNumber !== null && channelNumber !== "") {
      const parsed = parseInt(channelNumber, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        const exists = await Channel.findOne({ channelNumber: parsed, _id: { $ne: id } });
        if (exists) {
          return res.status(409).json({
            error: `Channel number ${parsed} is already taken by "${exists.name}". Please choose a different number.`
          });
        }
        channel.channelNumber = parsed;
      }
    }

    if (name !== undefined) channel.name = name;
    if (videoUrl !== undefined) channel.videoUrl = videoUrl;
    if (language !== undefined) channel.language = language;
    if (category !== undefined) channel.category = category;
    if (drm !== undefined) channel.drm = drm;
    if (status !== undefined) channel.status = status;

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
    if (err.code === 11000) {
      return res.status(409).json({ error: "Channel number already exists. Please choose a different number." });
    }
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
