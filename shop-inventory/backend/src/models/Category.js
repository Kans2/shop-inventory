const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: [true, "Category name is required"], trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 200, default: "" },
    color: { type: String, default: "#0f766e" },
  },
  { timestamps: true }
);

// Each store cannot have duplicate category names
categorySchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
