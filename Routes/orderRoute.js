const express = require("express");

const authcontroller = require("../controllers/authcontroller");

const {
  createCashOrder,
  getAllOrders,
  getSpecificOrder,
  filterOrdersForLoggedUser,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} = require("../controllers/orderController");

const router = express.Router();

router.use(authcontroller.protect);

router.get(
  "/checkout-session/:cartId",
  authcontroller.allowedTo("user"),
  checkoutSession
);

router
  .route("/:cartId")
  .post(authcontroller.allowedTo("user"), createCashOrder);

// postBrands
router
  .route("/")
  .get(
    authcontroller.allowedTo("user", "admin", "manager"),
    filterOrdersForLoggedUser,
    getAllOrders
  );

router.route("/:id").get(filterOrdersForLoggedUser, getSpecificOrder);

router.put(
  "/:id/pay",
  authcontroller.allowedTo("admin", "manager"),
  updateOrderToPaid
);

router.put(
  "/:id/deliver",
  authcontroller.allowedTo("admin", "manager"),
  updateOrderToDelivered
);

module.exports = router;
