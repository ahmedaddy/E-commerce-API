const Factory = require("./handlersFactory");
const Review = require("../models/reviewModel");

// Nested Route (create)
exports.setReviewAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// Nested Route
// GET        /api/v1/roducts/:productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};

// @desc      get gatBrands
// @route     /api/v1/Brands
// @Access    Public
exports.getReviews = Factory.getAll(Review);

// @Desc      get specific Review by id
// @route     /api/v1/Reviews/:id
// @Access    Public
exports.getReview = Factory.getOne(Review);

// @Desc      Exporting the postReviews function
// @route     POST   /api/v1/Reviews
// @Access    Private/Protect/User
exports.postReviews = Factory.createOne(Review);

// @Desc      Update Spicific Review
// @route     PUT   /api/v1/Brands/:id
// @Access    Private/Protect/User
exports.updateReview = Factory.updateOne(Review);

// @Desc      Delete Spicific Review
// @route     delete   /api/v1/Reviews/:id
// @Access    Private/Protect/User-Admin-Manager
exports.deleteReview = Factory.deleteOne(Review);
