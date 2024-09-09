const express = require("express");

const authcontroller = require("../controllers/authcontroller");

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validators/categoryValidator");

const {
  postCategories,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage,
  setCategoryIdtoBody,
} = require("../controllers/categoryController");

const router = express.Router();

const subCategoriesRoute = require("./subCategoryRoutes");

router.use("/:categoryId/subCategories", subCategoriesRoute);

// postCategories
router
  .route("/")
  .post(
    authcontroller.protect,
    authcontroller.allowedTo("manager", "admin"),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidator,
    postCategories
  )
  .get(getCategories);
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    authcontroller.protect,
    authcontroller.allowedTo("manager", "admin"),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    authcontroller.protect,
    authcontroller.allowedTo("admin"),
    deleteCategoryValidator,
    deleteCategory
  );

module.exports = router;
