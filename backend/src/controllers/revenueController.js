const Transaction = require("../models/Transaction");
const User = require("../models/User");

/**
 * Get all Transactions
 */
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get Revenue Aggregated Statistics
 */
exports.getRevenueStats = async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: "Success" });
    const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);

    // Get count of unique users who purchased successfully
    const activeSubsCount = await User.countDocuments({ role: "user", isActive: true });
    
    // MRR calculation (Sum of last 30 days active purchases)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const mrrTransactions = await Transaction.find({
      status: "Success",
      createdAt: { $gte: thirtyDaysAgo }
    });
    const mrr = mrrTransactions.reduce((acc, t) => acc + t.amount, 0);

    // ARPU (Average Revenue Per User)
    const totalUsers = await User.countDocuments({ role: "user" });
    const arpu = totalUsers > 0 ? (totalRevenue / totalUsers).toFixed(2) : 0;

    res.json({
      totalRevenue,
      mrr,
      activeSubscriptions: activeSubsCount,
      arpu: parseFloat(arpu),
      salesCount: transactions.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Add a transaction
 */
exports.createTransaction = async (req, res) => {
  const { userEmail, planName, amount, status, paymentMethod } = req.body;
  try {
    const newTx = new Transaction({
      userEmail,
      planName,
      amount,
      status: status || "Success",
      paymentMethod: paymentMethod || "Stripe"
    });
    await newTx.save();
    res.json({ message: "Transaction added successfully", transaction: newTx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
