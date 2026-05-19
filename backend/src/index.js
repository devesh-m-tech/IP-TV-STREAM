const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./models/db"); // MongoDB connection helper

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin"); // optional admin routes
const channelRoutes = require("./routes/channel");
const planRoutes = require("./routes/plan");
const revenueRoutes = require("./routes/revenue");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded channel logos (images)
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Root route for testing
app.get("/", (req, res) => {
  res.send("✅ IPTV Backend is running");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // only if admin routes exist

// ✅ CHANNEL CRUD API
app.use("/api/channels", channelRoutes);

// ✅ PLANS & REVENUE API
app.use("/api/plans", planRoutes);
app.use("/api/revenue", revenueRoutes);


// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Internal server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
