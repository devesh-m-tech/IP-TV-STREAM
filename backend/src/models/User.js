const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  maxDevices: { type: Number, default: 3 },
  isActive: { type: Boolean, default: true },
  devices: [deviceSchema],
  createdAt: { type: Date, default: Date.now },
});

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("User", userSchema);
