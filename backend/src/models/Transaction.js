const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  planName: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Success", "Pending", "Failed"], default: "Success" },
  paymentMethod: { type: String, default: "Stripe" },
  createdAt: { type: Date, default: Date.now },
});

transactionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
