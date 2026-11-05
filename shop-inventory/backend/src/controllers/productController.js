const Category = require("../models/Category");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

// Only these fields can be set through create/update (quantity changes go through adjustStock)
const FIELDS = ["name", "sku", "category", "price", "lowStockThreshold"];
const pick = (body) => FIELDS.reduce((o, k) => (body[k] !== undefined ? { ...o, [k]: body[k] } : o), {});
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Sort map
const SORT_OPTIONS = {
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  stock_asc: { quantity: 1 },
  stock_desc: { quantity: -1 },
  newest: { createdAt: -1 },
};

// GET /api/products?q=&category=&lowStock=true&status=&sort=
exports.getProducts = asyncHandler(async (req, res) => {
  const { q, category, lowStock, status, sort = "name_asc" } = req.query;
  const filter = { owner: req.user._id };

  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { sku: rx }];
  }
  if (category) filter.category = category;

  if (status === "out_of_stock") {
    filter.quantity = 0;
  } else if (status === "low_stock" || lowStock === "true") {
    filter.$expr = { $and: [{ $lte: ["$quantity", "$lowStockThreshold"] }, { $gt: ["$quantity", 0] }] };
  } else if (status === "in_stock") {
    filter.$expr = { $gt: ["$quantity", "$lowStockThreshold"] };
  }

  const sortOrder = SORT_OPTIONS[sort] || { name: 1 };
  res.json(await Product.find(filter).sort(sortOrder));
});

// GET /api/products/categories
exports.getCategories = asyncHandler(async (req, res) => {
  const [distinctProductCats, savedCats] = await Promise.all([
    Product.distinct("category", { owner: req.user._id }),
    Category.find({ owner: req.user._id }).select("name"),
  ]);
  const set = new Set([...distinctProductCats, ...savedCats.map((c) => c.name)]);
  res.json(Array.from(set).sort());
});

// GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, owner: req.user._id });
  if (!product) throw httpError(404, "Product not found");
  res.json(product);
});

// POST /api/products
exports.createProduct = asyncHandler(async (req, res) => {
  const opening = Number(req.body.quantity) || 0;
  if (!Number.isInteger(opening) || opening < 0) throw httpError(400, "Quantity must be a whole number, 0 or more");

  const product = await Product.create({ ...pick(req.body), owner: req.user._id, quantity: opening });
  if (opening > 0) {
    await StockMovement.create({ owner: req.user._id, product: product._id, type: "in", quantity: opening, balanceAfter: opening, note: "Opening stock" });
  }
  res.status(201).json(product);
});

// PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, pick(req.body), { new: true, runValidators: true });
  if (!product) throw httpError(404, "Product not found");
  res.json(product);
});

// DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!product) throw httpError(404, "Product not found");
  await StockMovement.deleteMany({ product: product._id });
  res.json({ message: "Product deleted", id: product._id });
});

// POST /api/products/:id/stock   body: { type: "in" | "out", quantity, note }
exports.adjustStock = asyncHandler(async (req, res) => {
  const { type, note } = req.body;
  const qty = Number(req.body.quantity);
  if (!["in", "out"].includes(type)) throw httpError(400, 'Type must be "in" or "out"');
  if (!Number.isInteger(qty) || qty <= 0) throw httpError(400, "Quantity must be a whole number greater than 0");

  const filter = { _id: req.params.id, owner: req.user._id };
  if (type === "out") filter.quantity = { $gte: qty }; // atomic: never goes below zero

  const product = await Product.findOneAndUpdate(filter, { $inc: { quantity: type === "in" ? qty : -qty } }, { new: true });
  if (!product) {
    const exists = await Product.exists({ _id: req.params.id, owner: req.user._id });
    throw exists ? httpError(400, "Not enough stock for this removal") : httpError(404, "Product not found");
  }

  const movement = await StockMovement.create({ owner: req.user._id, product: product._id, type, quantity: qty, balanceAfter: product.quantity, note });
  res.json({ product, movement });
});

// GET /api/products/:id/movements
exports.getMovements = asyncHandler(async (req, res) => {
  const list = await StockMovement.find({ product: req.params.id, owner: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json(list);
});
