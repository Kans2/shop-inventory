const mongoose = require("mongoose");

// One row per stock change: gives you a full audit trail
const movementSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    type: { type: String, enum: ["in", "out"], required: true },
    quantity: { type: Number, required: true, min: 1 },
    balanceAfter: { type: Number, required: true },
    note: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockMovement", movementSchema);
