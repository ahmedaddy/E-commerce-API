const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const productModel = require("../../models/productModel");

exports.createCartValidator = [
  body("productId").notEmpty().withMessage("Product ID is required"),
];
