const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");
// const nodemailer = require("nodemailer");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");

const userModel = require("../models/userModel");
const generateToken = require("../utils/createToken");
const { sanitizeUser } = require("../utils/sanatizeData");

// @Desc      signUp
// @route     /api/v1/auth/signup
// @Access    Public
exports.signUp = asyncHandler(async (req, res, next) => {
  // 1 - Create User
  const user = await userModel.create({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    password: req.body.password,
  });
  // 2 - generate json web token (jwt)
  const token = generateToken(user._id);

  res.status(201).json({ data: sanitizeUser(user), token });
});

// @Desc      login
// @route     /api/v1/auth/login
// @Access    Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1) check if password and email in the body
  const user = await userModel.findOne({ email: req.body.email });

  // 2) check user exiset & chech if password if correct
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("incorrect email & password", 401));
  }
  // 3) generate token
  const token = generateToken(user._id);
  // 4) send response to client side
  res.status(200).json({ data: sanitizeUser(user), token });
});

exports.protect = asyncHandler(async (req, res, next) => {
  // 1) check if token exist , true get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login, please login to get access to this route"
      ),
      401
    );
  }

  // 2) varify token (expired token , no change happend)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) check if user exists
  const currentUser = await userModel.findById(decoded.userId);

  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }

  // 4) check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passwordChangedTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passwordChangedTimeStamp > decoded.iat) {
      return next(
        new ApiError(
          "User recentely change his password, Please login again..",
          401
        )
      );
    }
  }

  // 5) check if user is active
  if (!currentUser.active) {
    return next(
      new ApiError("Your account is Deleted, please contact support", 401)
    );
  }

  req.user = currentUser;

  next();
});

// @desc    Authorizition {User Permissions}
// ["admin", "manager"]
exports.allowedTo = (...roles) =>
  // 1) access rools
  asyncHandler(async (req, res, next) => {
    // 2) access registred user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

// exports.forgotPassword = asyncHandler(async (req, res, next) => {
//   const { email } = req.body;
//   const user = await userModel.findOne({ email });
//   if (!user) {
//     return next(new ApiError("User Not Found", 404));
//   }

//   const resetToken = generateToken(user._id);

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.APP_EMAIL_ADDRESS,
//       pass: process.env.APP_EMAIL_PASS,
//     },
//   });

//   const resetLink = `http://localhost:${process.env.PORT}/api/v1/auth/reset-password?token=${resetToken}`;

//   // Send email

//   const mailOptions = {
//     from: process.env.APP_EMAIL_ADDRESS,
//     to: "ahmedaddy013@gmail.com",
//     subject: "Password Reset",
//     html: `
//       <p>You requested a password reset. Please click the following link to reset your password:</p>
//       <a href="${resetLink}">Reset Password</a>
//     `,
//   };

//   transporter.sendMail(mailOptions);

//   res.status(201).json({ data: user, resetToken });
// });

// exports.resetPassword = asyncHandler(async (req, res, next) => {
//   const token = req.query.token;
//   const newPassword = req.body.newPassword;

//   console.log(newPassword);
//   console.log(token);

//   const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//   const user = await userModel.findOne({ _id: decoded.userId });

//   if (!user) {
//     return next(new ApiError("User not found", 404));
//   }

//   user.password = newPassword;
//   await user.save();

//   res.status(200).json({
//     status: "success",
//     message: "Password reset successfully.",
//   });
// });

// @Desc      Forgot Password
// @route     POST /api/v1/auth/forgotPassword
// @Access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) get user by email
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`there is no user with this email: ${req.body.email}`, 404)
    );
  }
  // 2) if user exist, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(resetCode);
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;

  // add expiration time
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // expires after 10 mins
  user.passwordResetVerified = false;

  await user.save();
  // 3) send the reset code via email
  const message = `Hi ${user.name} 
                    We received a request to reset the password on your E-Shop account.
                    ${resetCode}
                    Enter this code to complete the reset.
                    The E-Shop Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 minutes)",
      message,
    });
  } catch (error) {
    // Reset password reset related fields for the user
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();

    return next(new ApiError("there is an error in sending email", 500));
  }
  res
    .status(200)
    .json({ status: "success", message: "Reset code sent to email" });
});

// @Desc      Verify Password Reset Code
// @route     POST /api/v1/auth/verifyResetCode
// @Access    Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  //1- get user by reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await userModel.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError(`Reset code invalid or expired`, 404));
  }

  // 2- reset code valid
  user.passwordResetVerified = true;

  // save user (passwordResetCode && passwordResetExpires)
  await user.save();

  res.status(200).json({
    status: "success",
  });
});

// @Desc      Reset Password
// @route     POST /api/v1/auth/resetPassword
// @Access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new ApiError("There is no user with this email", 404));
  }

  // check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  user.password = req.body.newPassword;

  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3- generate token
  const token = generateToken(user._id);
  res.status(200).json({ token });
});
