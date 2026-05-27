const Reseller = require("../models/Reseller");

// Seed a single reference reseller if the database is completely empty
const seedSingleExample = async () => {
  try {
    const count = await Reseller.countDocuments();
    if (count === 0) {
      const seed = new Reseller({
        name: "Alpha Streams",
        username: "alpha_resell",
        email: "alpha@streams.com",
        users: 18,
        maxUsers: 50,
        balance: 240,
        commission: 25,
        lastLogin: "2 hours ago",
        status: "active"
      });
      await seed.save();
    }
  } catch (err) {
    console.error("Failed to seed example reseller:", err);
  }
};

exports.getResellers = async (req, res) => {
  try {
    await seedSingleExample();
    const resellers = await Reseller.find().sort({ createdAt: -1 });
    res.json(resellers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReseller = async (req, res) => {
  const { name, username, email, maxUsers, balance, commission, status } = req.body;
  try {
    const reseller = new Reseller({
      name,
      username,
      email,
      maxUsers: parseInt(maxUsers, 10) || 50,
      balance: parseFloat(balance) || 0,
      commission: parseInt(commission, 10) || 25,
      status: status || "active"
    });
    await reseller.save();
    res.json({ message: "Reseller created successfully", reseller });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateReseller = async (req, res) => {
  const { id } = req.params;
  const { name, email, maxUsers, commission, balance, status, lastLogin } = req.body;
  try {
    const reseller = await Reseller.findById(id);
    if (!reseller) return res.status(404).json({ error: "Reseller not found" });

    if (name !== undefined) reseller.name = name;
    if (email !== undefined) reseller.email = email;
    if (maxUsers !== undefined) reseller.maxUsers = parseInt(maxUsers, 10);
    if (commission !== undefined) reseller.commission = parseInt(commission, 10);
    if (balance !== undefined) reseller.balance = parseFloat(balance);
    if (status !== undefined) reseller.status = status;
    if (lastLogin !== undefined) reseller.lastLogin = lastLogin;

    await reseller.save();
    res.json({ message: "Reseller updated successfully", reseller });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReseller = async (req, res) => {
  const { id } = req.params;
  try {
    const reseller = await Reseller.findByIdAndDelete(id);
    if (!reseller) return res.status(404).json({ error: "Reseller not found" });
    res.json({ message: "Reseller deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
