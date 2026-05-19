const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true, default: "Monthly" }, // e.g., Monthly, Yearly
  maxDevices: { type: Number, required: true, default: 3 },
  resolution: { type: String, required: true, default: "HD" }, // e.g., SD, HD, UHD
  features: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

planSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("Plan", planSchema);
