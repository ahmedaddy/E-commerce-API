// eslint-disable-next-line import/no-extraneous-dependencies
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const asyncHandler = require("express-async-handler");
const Factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");

const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

// @desc      create cash order
// @route     POST  /api/v1/orders/:cartId
// @Access    Private - User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1 - get Cart by id
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`there is no cart with this id ${req.params.cartId}`, 404)
    );
  }
  // 2 - get order price depend on cart price "check if coupon applied"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3 - create order with cash payment method (default)
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });
  // 4 - after creating order, decrement product quantity and increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: {
          _id: item.product,
        },
        update: {
          $inc: {
            quantity: -item.quantity,
            sold: +item.quantity,
          },
        },
      },
    }));
    await Product.bulkWrite(bulkOption, {});
    // 5 - clear cart depend on cartId

    await Cart.findByIdAndDelete(req.params.cartId);
  }
  res.status(201).json({
    status: "success",
    data: order,
  });
});

exports.filterOrdersForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});

// @desc      Get All Orders
// @route     GET  /api/v1/orders
// @Access    Private - User
exports.getAllOrders = Factory.getAll(Order);

// @desc      Get All Orders
// @route     GET  /api/v1/orders/:orderId
// @Access    Private - User
exports.getSpecificOrder = Factory.getOne(Order);

// @desc      Update order paid status is paid
// @route     POST  /api/v1/orders/:id/pay
// @Access    Private - Admin
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `there is no such order for this user: ${req.params.id}`,
        404
      )
    );
  }
  // update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updateOrder = await order.save();

  res.status(201).json({
    status: "success",
    data: updateOrder,
  });
});

// @desc      Update order delivered status
// @route     POST  /api/v1/orders/:id/pay
// @Access    Private - Admin
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `there is no such order for this user: ${req.params.id}`,
        404
      )
    );
  }
  // update order to paid
  order.isDeliverd = true;
  order.deliveredAt = Date.now();

  const updateOrder = await order.save();

  res.status(201).json({
    status: "success",
    data: updateOrder,
  });
});

// @desc      GET checkout SESSION from STRIPE and send it as a response
// @route     GET  /api/v1/orders/checkout-session/:cartId
// @Access    Private - User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 15;
  const shippingPrice = 10;

  // 1 - get Cart by id
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`there is no cart with this id ${req.params.cartId}`, 404)
    );
  }
  // 2 - get order price depend on cart price "check if coupon applied"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) create stripe checkout SESSION
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: req.user.name,
          },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) send sessionto response
  res.status(200).json({
    status: "success",
    session,
  });
});