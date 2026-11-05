const mongoose = require("mongoose");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const asyncHandler = require("../utils/asyncHandler");

const isLow = { $lte: ["$quantity", "$lowStockThreshold"] };

// GET /api/dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const owner = new mongoose.Types.ObjectId(req.user.id); // aggregate() doesn't auto-cast ids

  const [statsRow, categories, lowStockItems, recentMovements] = await Promise.all([
    Product.aggregate([
      { $match: { owner } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalUnits: { $sum: "$quantity" },
          stockValue: { $sum: { $multiply: ["$price", "$quantity"] } },
          lowStock: { $sum: { $cond: [isLow, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] } },
        },
      },
    ]),
    Product.aggregate([
      { $match: { owner } },
      { $group: { _id: "$category", count: { $sum: 1 }, value: { $sum: { $multiply: ["$price", "$quantity"] } } } },
      { $sort: { value: -1 } },
      { $project: { _id: 0, category: "$_id", count: 1, value: 1 } },
    ]),
    Product.find({ owner, $expr: isLow }).sort({ quantity: 1 }).limit(8),
    StockMovement.find({ owner }).sort({ createdAt: -1 }).limit(8).populate("product", "name sku"),
  ]);

  const stats = statsRow[0] || { totalProducts: 0, totalUnits: 0, stockValue: 0, lowStock: 0, outOfStock: 0 };
  delete stats._id;
  res.json({ stats, categories, lowStockItems, recentMovements });
});
