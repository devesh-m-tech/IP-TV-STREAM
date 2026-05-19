const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Admin Login
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Create User
 */
exports.createUser = async (req, res) => {
  const { email, password, maxDevices = 3 } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS, 10));

    const user = new User({
      email,
      password: hashed,
      maxDevices,
      role: "user"
    });
    await user.save();
    res.json({ message: "User created", id: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all Users
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update User
 */
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, password, maxDevices } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (email) user.email = email;
    if (maxDevices !== undefined) user.maxDevices = maxDevices;
    if (password) {
      user.password = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS, 10));
    }

    await user.save();
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete User
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
