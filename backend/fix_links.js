const mongoose = require("mongoose");
const Channel = require("./src/models/Channel");
const dotenv = require("dotenv");

dotenv.config();

const fixLinks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB to fix links");

    // Add a GUARANTEED working test link to prove the player works
    await Channel.findOneAndUpdate(
      { name: "System Test Channel" },
      { 
        name: "System Test Channel (Working)", 
        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        language: "English",
        category: "Entertainment",
        logo: "https://cdn-icons-png.flaticon.com/512/716/716429.png"
      },
      { upsert: true }
    );

    // Update Sun TV with a different potential gateway link
    await Channel.updateMany(
      { name: /Sun Tv/i },
      { $set: { videoUrl: "https://mini.allinonereborn.fun/jiotv-in/app/ts_live_896.m3u8" } }
    );

    console.log("✅ Test channel added and links refreshed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Link update failed:", err.message);
    process.exit(1);
  }
};

fixLinks();
