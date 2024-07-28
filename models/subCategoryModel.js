const mongoose = require("mongoose");

const subCategoryModel = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, "Sub Category Must Be Unique"],
      minlength: [2, "Too short Sub Category name"],
      maxlength: [32, "Too long Sub Category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "category",
      required: [true, "Sub Category Must Be Belong To Parent Category"],
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("subCategory", subCategoryModel);
