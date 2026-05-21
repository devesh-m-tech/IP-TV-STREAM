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
        name: "Vijay TV HD",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-inn/app/ts_live_368.m3u8",
        language: "Tamil",
        category: "Entertainment",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Star_Vijay_logo.svg/512px-Star_Vijay_logo.svg.png"
      },
      {
        name: "Zee Tamil HD",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-inn/app/ts_live_297.m3u8",
        language: "Tamil",
        category: "Entertainment",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Zee_Tamil_logo_2023.svg/512px-Zee_Tamil_logo_2023.svg.png"
      },
      {
        name: "Sun TV HD",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-inn/app/ts_live_896.m3u8",
        language: "Tamil",
        category: "Entertainment",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Sun_TV_Network_Logo.svg/512px-Sun_TV_Network_Logo.svg.png"
      },
      {
        name: "Colors Tamil HD",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-inn/app/ts_live_923.m3u8",
        language: "Tamil",
        category: "Entertainment",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Colors_Tamil_logo.png/512px-Colors_Tamil_logo.png"
      },
      {
        name: "K Tv HD",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-in/app/ts_live_894.m3u8",
        language: "Tamil",
        category: "Movies",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/82/K_TV_logo.png/512px-K_TV_logo.png"
      },
      {
        name: "Vijay Super HD",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-inn/app/ts_live_371.m3u8",
        language: "Tamil",
        category: "Movies",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Star_Vijay_Super_logo.svg/512px-Star_Vijay_Super_logo.svg.png"
      },
      {
        name: "Zee Thirai HD",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-inn/app/ts_live_937.m3u8",
        language: "Tamil",
        category: "Movies",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8d/Zee_Thirai_logo.png/512px-Zee_Thirai_logo.png"
      },
      {
        name: "Sun Music HD",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-in/app/ts_live_895.m3u8",
        language: "Tamil",
        category: "Music",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0e/Sun_Music_logo.svg/512px-Sun_Music_logo.svg.png"
      },
      {
        name: "Movies Now HD",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-inn/app/ts_live_122.m3u8",
        language: "English",
        category: "Movies",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Movies_Now_logo.svg/512px-Movies_Now_logo.svg.png"
      },
      {
        name: "Star Movies HD",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-inn/app/ts_live_123.m3u8",
        language: "English",
        category: "Movies",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/88/Star_Movies_Asia.svg/512px-Star_Movies_Asia.svg.png"
      },
      {
        name: "&Flix HD",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-inn/app/ts_live_124.m3u8",
        language: "English",
        category: "Movies",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/%26flix_logo.png/512px-%26flix_logo.png"
      },
      {
        name: "Polimar_tv",
        videoUrl: "https://cdn-2.pishow.tv/live/1241/master.m3u8",
        language: "Tamil",
        category: "News",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Polimer_News_logo.png/512px-Polimer_News_logo.png"
      },
      {
        name: "Java Tv",
        videoUrl: "https://mini.allinonereborn.fun/jiotv-inn/app/ts_live_419.m3u8",
        language: "Tamil",
        category: "Entertainment",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Java_Television_logo.png/512px-Java_Television_logo.png"
      },
      {
        name: "youtube",
        videoUrl: "https://youtu.be/9M02G5c6x6w",
        language: "English",
        category: "Entertainment",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/YouTube_Logo_2017.svg/512px-YouTube_Logo_2017.svg.png"
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
