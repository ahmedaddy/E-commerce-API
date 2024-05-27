const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");

// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require("sharp");

const productModel = require("../models/productModel");
// eslint-disable-next-line import/extensions
const Factory = require("./handlersFactory.js");

// Setup Multer for handling multipart

const {
  uploadMixOfImages,
  // eslint-disable-next-line import/extensions
} = require("../middlewares/uploadImageMiddleware.js");

exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // console.log(req.files);
  // 1) image proccesing for image cover
  if (req.files.imageCover) {
    const imageCoverFilename = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFilename}`);

    // save image in our db
    req.body.imageCover = imageCoverFilename;
  }
  //1) image proccesing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        // save image in our db
        req.body.images.push(imageName);
      })
    );
    next();
  }
});

// @desc      get gatProducts
// @route     /api/v1/Products
// @Access    Public
exports.getProducts = Factory.getAll(productModel);

// @Desc      get specific Products by id
// @route     /api/v1/Products/:id
// @Access    Public
exports.getProduct = Factory.getOne(productModel, "reviews");

// @Desc      Exporting the postProducts function
// @route     POST   /api/v1/Products
// @Access    Private
exports.postProduct = Factory.createOne(productModel);

// @Desc      Update Spicific Product
// @route     PUT   /api/v1/Products/:id
// @Access    Private
exports.updateProduct = Factory.updateOne(productModel);

// @Desc      Delete Spicific Product
// @route     delete   /api/v1/Products/:id
// @Access    Private
exports.deleteProduct = Factory.deleteOne(productModel);
