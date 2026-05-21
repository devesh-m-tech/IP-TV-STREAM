const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./User");
const Plan = require("./Plan");
const Transaction = require("./Transaction");
const bcrypt = require("bcrypt");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
    await seedAdmin();
    await seedUser();
    await seedPlans();
    await seedTransactions();
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: "admin@iptv.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        email: "admin@iptv.com",
        password: hashedPassword,
        role: "admin",
        maxDevices: 100
      });
      console.log("👤 Default admin created: admin@iptv.com / admin123");
    }
  } catch (err) {
    console.error("❌ Error seeding admin:", err.message);
  }
};

const seedUser = async () => {
  try {
    const userExists = await User.findOne({ email: "user@iptv.com" });
    if (!userExists) {
      const hashedPassword = await bcrypt.hash("user123", 10);
      await User.create({
        email: "user@iptv.com",
        password: hashedPassword,
        role: "user",
        maxDevices: 3
      });
      console.log("👤 Default user created: user@iptv.com / user123");
    }
  } catch (err) {
    console.error("❌ Error seeding user:", err.message);
  }
};

const seedPlans = async () => {
  try {
    const plansExist = await Plan.findOne();
    if (!plansExist) {
      const defaultPlans = [
        {
          name: "Basic SD Plan",
          price: 149.00,
          duration: "Monthly",
          maxDevices: 1,
          resolution: "SD",
          features: ["Access to 100+ Channels", "Standard SD quality", "Single screen view"]
        },
        {
          name: "Standard HD Plan",
          price: 299.00,
          duration: "Monthly",
          maxDevices: 3,
          resolution: "HD",
          features: ["Access to 300+ Channels", "Full HD (1080p)", "Up to 3 devices concurrently", "Ad-Free Streaming"]
        },
        {
          name: "Premium 4K Plan",
          price: 499.00,
          duration: "Monthly",
          maxDevices: 5,
          resolution: "UHD",
          features: ["Access to 1000+ Channels", "Ultra HD (4K) + HDR", "Up to 5 devices concurrently", "Priority 24/7 Support"]
        }
      ];
      await Plan.insertMany(defaultPlans);
      console.log("🎫 Seeded default subscription plans in Indian Rupees (INR)");
    }
  } catch (err) {
    console.error("❌ Error seeding plans:", err.message);
  }
};

const seedTransactions = async () => {
  try {
    const txsExist = await Transaction.findOne();
    if (!txsExist) {
      const mockTxs = [
        { userEmail: "john@gmail.com", planName: "Standard HD Plan", amount: 299.00, status: "Success", paymentMethod: "Razorpay", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { userEmail: "alice@yahoo.com", planName: "Premium 4K Plan", amount: 499.00, status: "Success", paymentMethod: "UPI Pay", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { userEmail: "bob@iptv.com", planName: "Basic SD Plan", amount: 149.00, status: "Success", paymentMethod: "Razorpay", createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
        { userEmail: "clara@outlook.com", planName: "Standard HD Plan", amount: 299.00, status: "Failed", paymentMethod: "NetBanking", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { userEmail: "user@iptv.com", planName: "Premium 4K Plan", amount: 499.00, status: "Success", paymentMethod: "Credit Card", createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
        { userEmail: "david@gmail.com", planName: "Standard HD Plan", amount: 299.00, status: "Success", paymentMethod: "Razorpay", createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
        { userEmail: "sophia@web.de", planName: "Premium 4K Plan", amount: 499.00, status: "Success", paymentMethod: "UPI Pay", createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
        { userEmail: "emma@test.com", planName: "Basic SD Plan", amount: 149.00, status: "Success", paymentMethod: "Razorpay", createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) }
      ];
      await Transaction.insertMany(mockTxs);
      console.log("💸 Seeded mock revenue transactions in Indian Rupees (INR)");
    }
  } catch (err) {
    console.error("❌ Error seeding transactions:", err.message);
  }
};

module.exports = connectDB;

