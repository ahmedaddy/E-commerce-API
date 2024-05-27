const express = require("express");
const {
  createSubCategory,
  getSubCategory,
  getSubCategories,
  deleteSubCategory,
  updateSubCategory,
  createFilterObj,
  setCategoryIdtoBody,
} = require("../controllers/subCategoryController");
const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  deleteSubCategoryValidator,
  updateSubCategoryValidator,
} = require("../utils/validators/subCategoryValidator");
const authcontroller = require("../controllers/authcontroller");

// Merge Params: Allow us to access parameters on other routers
// ex: we need to access categorieId from the category router
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    authcontroller.protect,
    authcontroller.allowedTo("admin", "manager"),
    setCategoryIdtoBody,
    createSubCategoryValidator,
    createSubCategory
  )
  .get(createFilterObj, getSubCategories);
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .delete(
    authcontroller.protect,
    authcontroller.allowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory
  )
  .put(
    authcontroller.protect,
    authcontroller.allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    updateSubCategory
  );
module.exports = router;
