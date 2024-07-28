const subCategoryModel = require("../models/subCategoryModel");

const Factory = require("./handlersFactory");

exports.setCategoryIdtoBody = (req, res, next) => {
  // Nested Route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};

exports.createSubCategory = Factory.createOne(subCategoryModel);

// @desc      get gatsubCategories
// @route     /api/v1/subCategories
// @Access    Public

exports.getSubCategories = Factory.getAll(subCategoryModel);

// @Desc      get specific categorie by id
// @route     /api/v1/categories/:id
// @Access    Public
exports.getSubCategory = Factory.getOne(subCategoryModel);

// @Desc      Update Spicific subCategory
// @route     PUT   /api/v1/subCategory/:catId
// @Access    Private
exports.updateSubCategory = Factory.updateOne(subCategoryModel);

// @Desc      Delete Spicific subCategory
// @route     delete   /api/v1/subCategory/:catId
// @Access    Private
exports.deleteSubCategory = Factory.deleteOne(subCategoryModel);
