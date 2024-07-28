const express = require("express");
const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../utils/validators/brandValidator");

const authcontroller = require("../controllers/authcontroller");

const {
  postBrands,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  uploadCategoryImage,
  resizeImage,
  setBrandIdtoBody,
} = require("../controllers/brandController");

const router = express.Router();

// router.use("/:BrandId/subBrands", subBrandsRoute);

// postBrands
router
  .route("/")
  .post(
    authcontroller.protect,
    authcontroller.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    createBrandValidator,
    postBrands
  )
  .get(getBrands);
router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    authcontroller.protect,
    authcontroller.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(
    authcontroller.protect,
    authcontroller.allowedTo("admin"),
    deleteBrandValidator,
    deleteBrand
  );

module.exports = router;
