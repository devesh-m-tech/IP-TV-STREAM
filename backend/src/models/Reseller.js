const mongoose = require("mongoose");

const resellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  users: { type: Number, default: 0 },
  maxUsers: { type: Number, default: 50 },
  balance: { type: Number, default: 0 },
  commission: { type: Number, default: 25 },
  lastLogin: { type: String, default: "Never" },
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now },
});

resellerSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("Reseller", resellerSchema);
