const express = require("express");

const authcontroller = require("../controllers/authcontroller");

const {
  addProductToWishlist,
  RemoveProductFromWishlist,
  getProductFromWishlist,
} = require("../controllers/wishListController");
const {
  createWishListValidator,
} = require("../utils/validators/wishListValidator");

const router = express.Router();

router.use(authcontroller.protect, authcontroller.allowedTo("user"));

router
  .route("/")
  .post(createWishListValidator, addProductToWishlist)
  .get(getProductFromWishlist);

router.route("/:productId").delete(RemoveProductFromWishlist);

module.exports = router;
