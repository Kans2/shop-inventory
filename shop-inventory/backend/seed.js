// Usage: npm run seed   -> creates demo login  demo@shop.com / demo123
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");
const Product = require("./src/models/Product");
const Category = require("./src/models/Category");
const StockMovement = require("./src/models/StockMovement");

const categories = [
  { name: "Grocery", description: "Food grains, pulses, cooking oils and essentials", color: "#16a34a" },
  { name: "Beverages", description: "Tea, coffee, drinks and beverages", color: "#0284c7" },
  { name: "Stationery", description: "Pens, notebooks and office supplies", color: "#7c3aed" },
  { name: "Household", description: "Cleaning, detergent and maintenance supplies", color: "#ea580c" },
];

const items = [
  ["Basmati Rice 5kg", "RICE-5", "Grocery", 420, 40, 10],
  ["Sunflower Oil 1L", "OIL-1", "Grocery", 160, 4, 10],
  ["Toor Dal 1kg", "DAL-1", "Grocery", 145, 25, 8],
  ["Tea Powder 250g", "TEA-250", "Beverages", 130, 0, 6],
  ["Notebook A4 (200pg)", "NB-A4", "Stationery", 85, 60, 15],
  ["Ball Pen Blue (10pk)", "PEN-B10", "Stationery", 70, 3, 10],
  ["Detergent Powder 1kg", "DET-1", "Household", 120, 18, 5],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const old = await User.findOne({ email: "demo@shop.com" });
  if (old) {
    await Product.deleteMany({ owner: old._id });
    await Category.deleteMany({ owner: old._id });
    await StockMovement.deleteMany({ owner: old._id });
    await old.deleteOne();
  }
  const user = await User.create({ name: "Demo Owner", shopName: "Lakshmi Stores", email: "demo@shop.com", password: "demo123" });
  for (const cat of categories) {
    await Category.create({ owner: user._id, ...cat });
  }
  for (const [name, sku, category, price, quantity, lowStockThreshold] of items) {
    const p = await Product.create({ owner: user._id, name, sku, category, price, quantity, lowStockThreshold });
    if (quantity > 0) await StockMovement.create({ owner: user._id, product: p._id, type: "in", quantity, balanceAfter: quantity, note: "Opening stock" });
  }
  console.log("Seeded. Login: demo@shop.com / demo123");
  await mongoose.disconnect();
})();
