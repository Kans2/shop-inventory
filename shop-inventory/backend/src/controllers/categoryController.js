const Category = require("../models/Category");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

// GET /api/categories
// Returns categories with associated product count and total stock value
exports.getCategories = asyncHandler(async (req, res) => {
  const owner = req.user._id;

  // Fetch categories
  const categories = await Category.find({ owner }).sort({ name: 1 });

  // Compute product stats per category
  const stats = await Product.aggregate([
    { $match: { owner } },
    {
      $group: {
        _id: "$category",
        productCount: { $sum: 1 },
        totalStock: { $sum: "$quantity" },
        totalValue: { $sum: { $multiply: ["$price", "$quantity"] } },
      },
    },
  ]);

  const statsMap = new Map();
  stats.forEach((s) => statsMap.set(s._id, s));

  // Merge stats into categories
  const enriched = categories.map((cat) => {
    const s = statsMap.get(cat.name) || { productCount: 0, totalStock: 0, totalValue: 0 };
    return {
      _id: cat._id,
      name: cat.name,
      description: cat.description,
      color: cat.color,
      createdAt: cat.createdAt,
      productCount: s.productCount,
      totalStock: s.totalStock,
      totalValue: s.totalValue,
    };
  });

  // Also check if there are products with categories not yet saved as Category documents
  const registeredNames = new Set(categories.map((c) => c.name.toLowerCase()));
  for (const s of stats) {
    if (s._id && !registeredNames.has(s._id.toLowerCase())) {
      enriched.push({
        _id: null,
        name: s._id,
        description: "Auto-detected category",
        color: "#64748b",
        productCount: s.productCount,
        totalStock: s.totalStock,
        totalValue: s.totalValue,
        isAdHoc: true,
      });
    }
  }

  res.json(enriched);
});

// POST /api/categories
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;
  if (!name || !name.trim()) throw httpError(400, "Category name is required");

  const cleanName = name.trim();
  const existing = await Category.findOne({
    owner: req.user._id,
    name: { $regex: new RegExp(`^${cleanName}$`, "i") },
  });

  if (existing) {
    throw httpError(409, `Category "${cleanName}" already exists`);
  }

  const category = await Category.create({
    owner: req.user._id,
    name: cleanName,
    description: description ? description.trim() : "",
    color: color || "#0f766e",
  });

  res.status(201).json(category);
});

// PUT /api/categories/:id
exports.updateCategory = asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;
  const category = await Category.findOne({ _id: req.params.id, owner: req.user._id });
  if (!category) throw httpError(404, "Category not found");

  const oldName = category.name;
  if (name && name.trim()) {
    const newName = name.trim();
    if (newName.toLowerCase() !== oldName.toLowerCase()) {
      const existing = await Category.findOne({
        owner: req.user._id,
        name: { $regex: new RegExp(`^${newName}$`, "i") },
        _id: { $ne: category._id },
      });
      if (existing) throw httpError(409, `Category "${newName}" already exists`);
    }
    category.name = newName;
  }

  if (description !== undefined) category.description = description.trim();
  if (color !== undefined) category.color = color;

  await category.save();

  // If category name changed, synchronize existing products
  if (name && name.trim() !== oldName) {
    await Product.updateMany({ owner: req.user._id, category: oldName }, { category: category.name });
  }

  res.json(category);
});

// DELETE /api/categories/:id
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!category) throw httpError(404, "Category not found");

  // Reassign products in this deleted category to "General"
  await Product.updateMany({ owner: req.user._id, category: category.name }, { category: "General" });

  res.json({ message: "Category deleted", id: category._id });
});
