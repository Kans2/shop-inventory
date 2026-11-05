const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

exports.protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) throw httpError(401, "Please log in to continue");

  const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, "Account no longer exists");

  req.user = user;
  next();
});
