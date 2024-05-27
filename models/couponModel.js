const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "coupon name required"],
      unique: [true, "coupon name must be unique"],
    },
    expire: {
      type: Date,
      required: [true, "coupon expired time required"],
    },
    discount: {
      type: Number,
      required: [true, "coupon discount value required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
