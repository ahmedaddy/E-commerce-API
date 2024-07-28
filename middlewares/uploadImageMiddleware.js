// const fs = require("fs");
// Setup Multer for handling multipart
const multer = require("multer");
// eslint-disable-next-line import/extensions
const ApiError = require("../utils/apiError.js");

const multerOptions = () => {
  // memory storage engine
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("only images allowed", 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixOfImages = (arrOfFields) =>
  multerOptions().fields(arrOfFields);

// exports.uploadSingleImage = (fieldName) => {
//   // // Ensure the destination directory exists
//   // const directory = "uploads/categories";
//   // if (!fs.existsSync(directory)) {
//   //   fs.mkdirSync(directory, { recursive: true }, (err) => {
//   //     if (err) {
//   //       console.error("Error creating directory:");
//   //     } else {
//   //       console.log("Directory created successfully");
//   //     }
//   //   });
//   // }

//   // disk storage engine
//   // const multerStorage = multer.diskStorage({
//   //   destination: function (req, file, cb) {
//   //     cb(null, "uploads/categories");
//   //   },
//   //   filename: function (req, file, cb) {
//   //     // category-${id}-Date.now().jpeg
//   //     const ext = file.mimetype.split("/")[1];
//   //     const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;
//   //     cb(null, filename);
//   //   },
//   // });

//   MulterOptions().single(fieldName);
// };
