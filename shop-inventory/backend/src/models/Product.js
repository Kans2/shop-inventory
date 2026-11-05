const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: [true, "Product name is required"], trim: true, maxlength: 120 },
    sku: { type: String, required: [true, "SKU is required"], trim: true, uppercase: true, maxlength: 40 },
    category: { type: String, trim: true, default: "General" },
    price: { type: Number, required: [true, "Price is required"], min: [0, "Price cannot be negative"] },
    quantity: { type: Number, default: 0, min: [0, "Stock cannot be negative"] },
    lowStockThreshold: { type: Number, default: 5, min: [0, "Threshold cannot be negative"] },
  },
  { timestamps: true }
);

// A shop can't have two products with the same SKU
productSchema.index({ owner: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);
