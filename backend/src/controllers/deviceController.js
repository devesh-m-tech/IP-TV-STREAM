const User = require("../models/User");

// Get all devices for a user
exports.getDevicesByUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Revoke a device
exports.revokeDevice = async (req, res) => {
  const { id, deviceId } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.devices = user.devices.filter(d => d.deviceId !== deviceId);
    await user.save();
    
    res.json({ message: "Device revoked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
