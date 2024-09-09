const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require("sharp");

const brandModel = require("../models/brandModel");
const Factory = require("./handlersFactory");

const {
  uploadSingleImage,
  // eslint-disable-next-line import/extensions
} = require("../middlewares/uploadImageMiddleware.js");

exports.uploadCategoryImage = uploadSingleImage("image");

// image resize processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.webp`;
  if (req.file) {
    await sharp(req.file.buffer)
      // .resize(300, 300)
      .toFormat("webp")
      .webp({ quality: 60 })
      .toFile(`uploads/brands/${filename}`);

    // save image in our db
    req.body.image = filename;
  }

  next();
});

// @desc      get gatBrands
// @route     /api/v1/Brands
// @Access    Public
exports.getBrands = Factory.getAll(brandModel);

// @Desc      get specific Brand by id
// @route     /api/v1/Brands/:id
// @Access    Public
exports.getBrand = Factory.getOne(brandModel);

// @Desc      Exporting the postBrands function
// @route     POST   /api/v1/Brands
// @Access    Private/Admin-Manager
exports.postBrands = Factory.createOne(brandModel);

// @Desc      Update Spicific Brand
// @route     PUT   /api/v1/Brands/:id
// @Access    Private/Admin-Manager
exports.updateBrand = Factory.updateOne(brandModel);

// @Desc      Delete Spicific Brand
// @route     delete   /api/v1/Brands/:id
// @Access    Private/Admin-Manager
exports.deleteBrand = Factory.deleteOne(brandModel);
