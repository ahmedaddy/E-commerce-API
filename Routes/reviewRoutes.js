const express = require("express");
const {
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
  createReviewValidator,
} = require("../utils/validators/reviewValidator");

const authcontroller = require("../controllers/authcontroller");

const {
  postReviews,
  getReview,
  getReviews,
  updateReview,
  deleteReview,
  createFilterObj,
  setReviewAndUserIdToBody,
} = require("../controllers/reviewController");

const router = express.Router({ mergeParams: true });

// postBrands
router
  .route("/")
  .post(
    authcontroller.protect,
    authcontroller.allowedTo("user"),
    setReviewAndUserIdToBody,
    createReviewValidator,
    postReviews
  )
  .get(createFilterObj, getReviews);
router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(
    authcontroller.protect,
    authcontroller.allowedTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authcontroller.protect,
    authcontroller.allowedTo("admin", "manager", "user"),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
