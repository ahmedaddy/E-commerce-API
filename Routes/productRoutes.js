const express = require("express");
const {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");
const {
  postProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require("../controllers/productController");
const authcontroller = require("../controllers/authcontroller");
const reviewsRoute = require("./reviewRoutes");

// const router = express.Router();
const router = express.Router();

// @@@@@@@ Nested Routes
// POST        /products/dsafdasfklgdf514/reviews
// GET         /products/dsafdasfklgdf514/reviews
// GET         /products/dsafdasfklgdf514/reviews/poidfsaoipasdlk;kj

router.use("/:productId/reviews", reviewsRoute);

// postCategories
router
  .route("/")
  .post(
    authcontroller.protect,
    authcontroller.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    postProduct
  )
  .get(getProducts);

router
  .route("/:id")
  .delete(
    authcontroller.protect,
    authcontroller.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct
  )
  .get(getProductValidator, getProduct)
  .put(
    authcontroller.protect,
    authcontroller.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  );

module.exports = router;
