const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const Product = require("../../models/productModel");

exports.createWishListValidator = [
  check("productId")
    .isMongoId()
    .withMessage("Product Id must be a valid MongoDB ObjectId")
    .bail() // Stop validation if the productId is not a valid MongoDB ObjectId
    .custom(async (val, { req }) => {
      const product = await Product.findOne({ _id: val });
      if (!product) {
        return Promise.reject(new Error("No Product with this ID"));
      }
    }),
  validatorMiddleware,
];
