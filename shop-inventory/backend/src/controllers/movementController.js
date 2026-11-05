const StockMovement = require("../models/StockMovement");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

// GET /api/movements
exports.getMovements = asyncHandler(async (req, res) => {
  const { type, productId, limit = 50, page = 1 } = req.query;
  const filter = { owner: req.user._id };

  if (type && ["in", "out"].includes(type)) {
    filter.type = type;
  }
  if (productId) {
    filter.product = productId;
  }

  const lim = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * lim;

  const [movements, total, summary] = await Promise.all([
    StockMovement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .populate("product", "name sku category price quantity"),
    StockMovement.countDocuments(filter),
    StockMovement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$type",
          totalQuantity: { $sum: "$quantity" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const summaryObj = { in: 0, out: 0 };
  summary.forEach((s) => {
    if (s._id in summaryObj) summaryObj[s._id] = s.totalQuantity;
  });

  res.json({
    movements,
    total,
    page: Number(page) || 1,
    totalPages: Math.ceil(total / lim) || 1,
    summary: summaryObj,
  });
});
