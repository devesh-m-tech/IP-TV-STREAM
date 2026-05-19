const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * User Login with Device Restriction
 */
exports.login = async (req, res) => {
  const { email, password, deviceId } = req.body;

  if (!deviceId) {
    return res.status(400).json({ error: "Device ID is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    // Check if device is already registered
    const isDeviceRegistered = user.devices.some(d => d.deviceId === deviceId);

    if (!isDeviceRegistered) {
      if (user.devices.length >= user.maxDevices) {
        return res.status(403).json({ error: "Device limit reached" });
      }
      // Register device
      user.devices.push({ deviceId });
      await user.save();
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * User Logout (free up device slot)
 */
exports.logout = async (req, res) => {
  const { email, deviceId } = req.body;

  if (!email || !deviceId) {
    return res.status(400).json({ error: "Email and deviceId are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.devices = user.devices.filter(d => d.deviceId !== deviceId);
    await user.save();

    res.json({ message: "Device logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get User Profile
 */
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      maxDevices: user.maxDevices,
      activeDevices: user.devices.map((d) => d.deviceId),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin Dashboard Example
 */
exports.adminDashboard = (req, res) => {
  res.json({ message: "Welcome Admin!", user: req.user });
};
