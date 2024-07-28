const path = require("path");
// Import required modules
const express = require("express");
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-require
const dotenv = require("dotenv");
const morgan = require("morgan");

const cors = require("cors");

const compression = require("compression");

const punycode = require('punycode/');


// eslint-disable-next-line import/no-extraneous-dependencies
const hpp = require("hpp");

// eslint-disable-next-line import/no-extraneous-dependencies
const mongoSanitize = require("express-mongo-sanitize");
// eslint-disable-next-line import/no-extraneous-dependencies
const xss = require("xss-clean");
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require("helmet");

// Load environment variables from config.env file
dotenv.config({ path: "./config.env" });

// Import custom error class
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errMiddleware");

// Establish database connection
const dbConnection = require("./config/database");

// Mount Routers ==================================================>
const mountRoutes = require("./Routes/index");
const { webhookCheckout } = require("./controllers/orderController");

dbConnection();

const app = express();
app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(express.json({ limit: "5mb" }));
// enable outher domains to access your application
app.use(compression());

// checkout webhook
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

// MiddelWare
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${process.env.NODE_ENV} `);
}

// This module searches for any keys in objects that begin with a $ sign or contain a ., from req.body, req.query or req.params. It can then either:
app.use(mongoSanitize());

// This will sanitize any data in req.body, req.query, and req.params. You can also access the API directly if you don't want to use as middleware.
app.use(xss());

// middleware to protect against HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: [
      "price",
      "sold",
      "quantity",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);

// Mount Routes
mountRoutes(app);
// app.use("/api/v1/categories", categoryRoute);
// app.use("/api/v1/subCategories", subCategoryRoute);
// app.use("/api/v1/brand", brandRoute);
// app.use("/api/v1/products", productRoute);
// app.use("/api/v1/users", userRoute);
// app.use("/api/v1/auth", authRoute);
// app.use("/api/v1/review", reviewRoute);
// app.use("/api/v1/wishlist", wishList);
// app.use("/api/v1/addresses", addresses);
// app.use("/api/v1/coupon", couponRoute);

app.all("*", (req, res, next) => {
  // const err = new Error(`Can't find this route ; ${req.originalUrl}`);
  // next(err.message);
  next(new ApiError(`Can't find this route ; ${req.originalUrl}`, 400));
});

// Global Middleware to handle errors for express
app.use(globalError);

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
// Events => listen => callBack(err)
// Handle rejictions outside express
process.on("unhandledRejection", (err) => {
  console.log(`unhandledRejection Errors : ${err.name}| ${err.message}`);
  server.close(() => {
    console.log(`shutting down application....`);
    process.exit(1);
  });
});
