const mongoose = require("mongoose");

const adSchema = new mongoose.Schema({
  imageUrl:   { type: String, required: true },  // Full image URL (external or /uploads/...)
  title:      { type: String, required: true },  // e.g. "POORVIKA"
  subtitle:   { type: String, default: "" },     // e.g. "APPLIANCES"
  slogan:     { type: String, default: "" },     // e.g. "THINK AC! Think Poorvika!"
  sponsorLabel: { type: String, default: "SPONSORED BY" },
  isActive:   { type: Boolean, default: true },
  createdAt:  { type: Date, default: Date.now },
});

adSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("Ad", adSchema);
