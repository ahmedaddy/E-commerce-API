const mongoose = require("mongoose");

const cartShema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: String,
        price: Number,
      },
    ],
    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,
    coupon: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

cartShema.pre(/^find/, function (next) {
  this.populate("cartItems.product");
  next();
});

module.exports = mongoose.model("Cart", cartShema);
