const mongoose = require("mongoose");
const Channel = require("./src/models/Channel");
const dotenv = require("dotenv");

dotenv.config();

const seedChannels = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB for seeding");

    await Channel.deleteMany({});
    const sampleChannels = [
      {
        name: "Sun TV HD",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-inn/app/ts_live_896.m3u8",
        language: "Tamil",
        category: "Entertainment",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Sun_TV_Network_Logo.svg/512px-Sun_TV_Network_Logo.svg.png"
      },
      {
        name: "Vijay TV HD",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-in/app/ts_live_894.m3u8",
        language: "Tamil",
        category: "Entertainment",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Star_Vijay_logo.svg/512px-Star_Vijay_logo.svg.png"
      },
      {
        name: "Sun Music HD",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-in/app/ts_live_895.m3u8",
        language: "Tamil",
        category: "Music",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0e/Sun_Music_logo.svg/512px-Sun_Music_logo.svg.png"
      }
    ];


    await Channel.insertMany(sampleChannels);
    console.log("✅ Sample channels seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedChannels();
