const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const Channel = require('../src/models/Channel');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const channels = await Channel.find({ name: /Vijay/i });
  console.log(JSON.stringify(channels, null, 2));
  process.exit(0);
}
check();
