const asyncHandler = require("express-async-handler");

// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require("sharp");

// eslint-disable-next-line import/no-extraneous-dependencies
const { v4: uuidv4 } = require("uuid");
// eslint-disable-next-line import/extensions
const Factory = require("./handlersFactory.js");

const categoryModel = require("../models/categoryModel");
const {
  uploadSingleImage,
  // eslint-disable-next-line import/extensions
} = require("../middlewares/uploadImageMiddleware.js");
// upload single image
exports.uploadCategoryImage = uploadSingleImage("image");
// image resize processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.webp`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(300, 300)
      .toFormat("webp")
      .webp({ quality: 60 })
      .toFile(`uploads/categories/${filename}`);

    // save image in our db
    req.body.image = filename;
  }

  next();
});

// @desc      get gatcategories
// @route     /api/v1/categories
// @Access    Public
exports.getCategories = Factory.getAll(categoryModel);

// @Desc      get specific categorie by id
// @route     /api/v1/categories/:id
// @Access    Public
exports.getCategory = Factory.getOne(categoryModel);

// @Desc      Exporting the postCategories function
// @route     POST   /api/v1/categories
// @Access    Private/Admin-Manager
exports.postCategories = Factory.createOne(categoryModel);

// @Desc      Update Spicific category
// @route     PUT   /api/v1/categories/:id
// @Access    Private/Admin-Manager
exports.updateCategory = Factory.updateOne(categoryModel);

// @Desc      Delete Spicific category
// @route     delete   /api/v1/categories/:id
// @Access    Private/Admin-Manager
exports.deleteCategory = Factory.deleteOne(categoryModel);
