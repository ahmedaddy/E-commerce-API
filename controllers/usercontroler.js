const asyncHandler = require("express-async-handler");
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require("bcryptjs");

const { v4: uuidv4 } = require("uuid");

const sharp = require("sharp");
const ApiError = require("../utils/apiError");

const generateToken = require("../utils/createToken");
const Factory = require("./handlersFactory");
const userModel = require("../models/userModel");

const {
  uploadSingleImage,
  // eslint-disable-next-line import/extensions
} = require("../middlewares/uploadImageMiddleware.js");

// Upload single image
exports.uploadUserImage = uploadSingleImage("profileImg");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // Save image into our db
    req.body.profileImg = filename;
  }

  next();
});

// @desc      get gatUsers
// @route     /api/v1/users
// @Access    Private/Admin
exports.getUsers = Factory.getAll(userModel);

// @Desc      get specific categorie by id
// @route     /api/v1/users/:id
// @Access    Private/Admin
exports.getUser = Factory.getOne(userModel);

// @Desc      Exporting the postUser function
// @route     POST   /api/v1/users
// @Access    Private/Admin
exports.postUser = Factory.createOne(userModel);

// @Desc      Delete Spicific user
// @route     delete   /api/v1/users/:id
// @Access    Private/Admin
exports.deleteUser = Factory.deleteOne(userModel);

// @Desc      Update Spicific user
// @route     PUT   /api/v1/users/:id
// @Access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    {
      new: true,
    }
  );
  if (!document) {
    // res.status(404).json({ msg: `Not Found User For This ID : ${catId}` });
    return next(
      new ApiError(`Not Found User For This ID : ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: sanitizeUser(document) });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(
      new ApiError(`Not Found User For This ID : ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: document });
});

// @Desc      Get Logged user data
// @route     delete   /api/v1/users/getMe
// @Access    Private/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @Desc      Update Logged user Password
// @route     delete   /api/v1/users/updateMyPassword
// @Access    Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res) => {
  // 1- update user password based user payload (req.user._id)

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  // generate Token
  const token = generateToken(user._id);

  res.status(200).json({ data: user, token });
});

// @Desc      Update Logged user data (with out password)
// @route     delete   /api/v1/users/updateMe
// @Access    Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  /**
   * If email is changed, send confirmation mail to the new email
   */
  // if (!user.isEmailConfirmed && req.body.email !== req.user.email) {
  //   const verifyUrl = `http://localhost:3000/verifyemail?id=${
  //     user._id
  //   }&token=${generateToken(user._id, "emailVerification")}`;
  //   const subject = `Please Confirm your Email for account ${user.name}!`;
  //   const message = `Dear ${user.name},<br/>\nClick on the below link to verify your email address.<br/>
  //               <a href=${verifyUrl} target="_blank">Link</a>`;

  //   try {
  //     await sendEmail({
  //       email: req.body.email,
  //       subject,
  //       message,
  //     });
  //   } catch (error) {
  //     console.log("Error in sending verification email", error);
  //   }
  // }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @Desc      Desactivete Logged user data
// @route     delete   /api/v1/users/deleteMe
// @Access    Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res) => {
  await userModel.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({ status: "success" });
});
