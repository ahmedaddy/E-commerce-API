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

// router.use(authcontroller.protect, authcontroller.allowedTo("user"));
router.use(authcontroller.protect);

router
  .route("/")
  .post(
    authcontroller.allowedTo("user"),
    createWishListValidator,
    addProductToWishlist
  )
  .get(getProductFromWishlist);

router
  .route("/:productId")
  .delete(authcontroller.allowedTo("user"), RemoveProductFromWishlist);

module.exports = router;
