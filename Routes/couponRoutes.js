const express = require("express");

const authcontroller = require("../controllers/authcontroller");

const {
  postCoupon,
  getCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");

const router = express.Router();

router.use(
  authcontroller.protect,
  authcontroller.allowedTo("admin", "manager")
);

// postBrands
router.route("/").post(postCoupon).get(getCoupons);
router.route("/:id").get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;
