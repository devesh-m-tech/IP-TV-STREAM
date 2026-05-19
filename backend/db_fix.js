
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env from the correct path
dotenv.config({ path: path.join(__dirname, '.env') });

// Require model using relative path
const Channel = require('./src/models/Channel');

async function fix() {
  try {
    console.log('Connecting to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Update Sun Tv HD (using user-provided link)
    const res1 = await Channel.updateOne(
      { name: /Sun Tv/i },
      { $set: { videoUrl: 'https://mini.allinonereborn.fun/jiotv-inn/app/ts_live_896.m3u8' } }
    );
    console.log('Sun TV Update:', res1);

    // 2. Update Vijay tv HD (using the user-provided link)
    const res2 = await Channel.updateOne(
      { name: /Vijay/i },
      { $set: { videoUrl: 'https://jtvxweb.pages.dev/pind?id=368' } }
    );
    console.log('Vijay TV Update:', res2);

    // 3. Clean up any other local 'C:/' paths that are blocking logos
    const res3 = await Channel.updateMany(
      { logo: { $regex: /^C:/i } },
      { $set: { logo: null } }
    );
    console.log('Cleanup Local Paths:', res3);

    console.log('🚀 Database content fixed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Fix failed:', err.message);
    process.exit(1);
  }
}

fix();
