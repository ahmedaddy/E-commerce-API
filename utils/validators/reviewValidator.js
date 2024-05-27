const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const Review = require("../../models/reviewModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModel");

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("Review ratings required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("ratings value must be between 1 to 5"),
  check("user").isMongoId().withMessage("Invalid user ID Format"),
  check("product")
    .isMongoId()
    .withMessage("Invalid product ID Format")
    .custom((val, { req }) => {
      // Check if the user ID in the request body matches the authenticated user's ID
      if (req.user._id.toString() !== req.body.user) {
        return Promise.reject(
          new Error(
            "You are not authorized to create a review for another user."
          )
        );
      }
      // check if logged user create review before
      return Review.findOne({
        user: req.user._id,
        product: req.body.product,
      }).then((review) => {
        if (review) {
          return Promise.reject(
            new Error("you Already Created a review before")
          );
        }
      });
    }),
  // .custom((val, { req }) =>
  //   // check if logged user create review before
  //   Review.findOne({
  //     user: req.user._id,
  //     product: req.body.product,
  //   }).then((review) => {
  //     if (review) {
  //       return Promise.reject(
  //         new Error("you Already Created a review before")
  //       );
  //     }
  //   })
  // ),

  validatorMiddleware,
];
exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review ID Format")
    .custom((val, { req }) =>
      // check if review ownerchip before update
      Review.findById(val).then((review) => {
        // console.log(req.user);
        if (!review) {
          return Promise.reject(
            new Error(`There is no review wit this id ${val}`)
          );
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`You are not allowed to perform this action`)
          );
        }
      })
    ),
  check("ratings")
    .notEmpty()
    .withMessage("Review ratings required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("ratings value must be between 1 to 5"),
  validatorMiddleware,
];
exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review ID Format")
    .custom((val, { req }) => {
      // check if review ownerchip before
      if (req.user.role === "user") {
        return Review.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`There is no review wit this id ${val}`)
            );
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error(`You are not allowed to perform this action`)
            );
          }
        });
      }
      return true;
    }),

  validatorMiddleware,
];
exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Brand ID Format"),
  validatorMiddleware,
];
