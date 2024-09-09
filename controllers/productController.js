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
const convertBufferToBase64 = (buffer) => {
  return buffer.toString("base64");
};

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // console.log(req.files);
  // 1) image proccesing for image cover
  // Initialize arrays if not already present
  req.body.imagesBase64 = [];
  try {
    if (req.files && req.files.imageCover) {
      // Process image cover
      const imageCoverFilename = `product-${uuidv4()}-${Date.now()}-cover.webp`;

      await sharp(req.files.imageCover[0].buffer)
        // .resize(405, 720)
        .toFormat("webp")
        .webp({ quality: 60 })
        .toFile(`uploads/products/${imageCoverFilename}`);

      const imageCoverBase64 = convertBufferToBase64(
        req.files.imageCover[0].buffer
      );
      // console.log(`data:image/jpeg;base64,${imageCoverBase64}`);

      req.body.imageCover = imageCoverFilename;
      // req.body.imageCoverBase64 = `data:image/jpeg;base64,${imageCoverBase64}`;
    }

    if (req.files && req.files.images) {
      // Process images
      req.body.images = [];
      await Promise.all(
        req.files.images.map(async (img, index) => {
          const imageName = `product-${uuidv4()}-${Date.now()}-${
            index + 1
          }.webp`;

          await sharp(img.buffer)
            // .resize(405, 720)
            .toFormat("webp")
            .webp({ quality: 60 })
            .toFile(`uploads/products/${imageName}`);

          req.body.images.push(imageName);
          // Convert the image buffer to a base64 string
          // const imageBase64 = convertBufferToBase64(img.buffer);
          // const imageBase64String = `data:image/jpeg;base64,${imageBase64}`;
          // req.body.imagesBase64.push(imageBase64String);
        })
      );
    }

    // Call next middleware or route handler
    next();
  } catch (error) {
    // Handle any errors
    next(error); // Pass error to Express error handler
  }
});

// @desc      get gatProducts
// @route     /api/v1/Products
// @Access    Public
exports.getProducts = Factory.getAll(productModel, (modelName = "products"));

// @Desc      get specific Products by id
// @route     /api/v1/Products/:id
// @Access    Public
exports.getProduct = Factory.getOne(productModel, "reviews brand category");

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
