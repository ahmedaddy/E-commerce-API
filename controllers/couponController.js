const Factory = require("./handlersFactory");
const Coupon = require("../models/couponModel");

// @desc      get list of Coupons
// @route     /api/v1/copons
// @Access    Private/admin-manager
exports.getCoupons = Factory.getAll(Coupon);

// @Desc      get specific Coupon by id
// @route     /api/v1/coupons/:id
// @Access    Private/admin-manager
exports.getCoupon = Factory.getOne(Coupon);

// @Desc      Exporting the postCoupons function
// @route     POST   /api/v1/coupons
// @Access    Private/Admin-Manager
exports.postCoupon = Factory.createOne(Coupon);

// @Desc      Update Spicific Coupon
// @route     PUT   /api/v1/coupons/:id
// @Access    Private/Admin-Manager
exports.updateCoupon = Factory.updateOne(Coupon);

// @Desc      Delete Spicific Coupon
// @route     delete   /api/v1/coupons/:id
// @Access    Private/Admin-Manager
exports.deleteCoupon = Factory.deleteOne(Coupon);
