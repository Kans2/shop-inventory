exports.notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });

exports.errorHandler = (err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ message: err.message });
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(", ") });
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID" });
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {}).includes("email") ? "Email is already registered" : "SKU already exists in your inventory";
    return res.status(409).json({ message: field });
  }
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Session expired. Please log in again" });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
};
