const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  language: { type: String, required: true },
  category: { type: String, required: true },
  videoUrl: { type: String, required: true },
  drm: { type: String, default: "CLEARKEY" },
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now },
});

channelSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("Channel", channelSchema);
