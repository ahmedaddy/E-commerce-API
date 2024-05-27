const mongoose = require("mongoose");
const Product = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "Min ratings value is 1.0"],
      max: [5, "Max ratings value is 5.0"],
      required: [true, "Review ratings required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to User"],
    },

    // parent reference (one to many)
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to Product"],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name -password" });
  next();
});

reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId
) {
  const statics = await this.aggregate([
    // stage 1 : get all reviews in specific product (productId)
    {
      $match: { product: productId },
    },
    // stage 2 : Grouping Reviews Based On Product Id and Calc AveravgRatings and ratingsQuantity
    {
      $group: {
        _id: "$product",
        avgRatings: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  // console.log(statics);
  if (statics.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: statics[0].avgRatings,
      ratingsQuantity: statics[0].ratingsQuantity,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

reviewSchema.post("deleteOne", async function (doc) {
  await this.model.calcAverageRatingsAndQuantity(doc.product);
});

module.exports = mongoose.model("Review", reviewSchema);
