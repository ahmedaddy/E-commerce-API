const path = require("path");
// Import required modules
const express = require("express");
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-unpublished-require
const dotenv = require("dotenv");
const morgan = require("morgan");
// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require("cors");
// eslint-disable-next-line import/no-extraneous-dependencies
const compression = require("compression");

// Load environment variables from config.env file
dotenv.config({ path: "./config.env" });

// Import custom error class
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errMiddleware");

// Establish database connection
const dbConnection = require("./config/database");

// const categoryRoute = require("./Routes/categorieRoutes");
// const subCategoryRoute = require("./Routes/subCategoryRoutes");
// const brandRoute = require("./Routes/brandRoutes");
// const productRoute = require("./Routes/productRoutes");
// const userRoute = require("./Routes/userRoutes");
// const authRoute = require("./Routes/authRoutes");
// const reviewRoute = require("./Routes/reviewRoutes");
// const wishList = require("./Routes/wishlistRoute");
// const addresses = require("./Routes/addressesRoute");
// const couponRoute = require("./Routes/couponRoutes");

// Mount Routers ==================================================>
const mountRoutes = require("./Routes/index");
const { webhookCheckout } = require("./controllers/orderController");

dbConnection();

const app = express();

// enable outher domains to access your application
app.use(cors());

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
