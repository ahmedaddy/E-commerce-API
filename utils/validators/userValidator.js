const slugify = require("slugify");
const { check, body } = require("express-validator");
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require("bcryptjs");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const userModel = require("../../models/userModel");

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User ID Format"),
  validatorMiddleware,
];

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User Required")
    .isLength({ min: 2 })
    .withMessage("Too short User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email Required")
    .isEmail()
    .withMessage("Invalid Email Address")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already used"));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password Required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password Confirmation Required")
    .custom((passwordConfirm, { req }) => {
      if (passwordConfirm !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-MA", "ar-EG"])
    .withMessage("Invalid phone number only accepted MR and EGY "),
  check("profileImg").optional(),
  check("role").optional(),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User ID Format"),
  check("name")
    .notEmpty()
    .withMessage("User Required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email Required")
    .isEmail()
    .withMessage("Invalid Email Address")
    .custom((val) =>
      userModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already used"));
        }
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-MA", "ar-EG"])
    .withMessage("Invalid phone number only accepted MR and EGY "),
  check("profileImg").optional(),
  check("role").optional(),
  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User Required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email Required")
    .isEmail()
    .withMessage("Invalid Email Address")
    .custom((val, { req }) => {
      return userModel.findOne({ _id: req.user._id }).then((currentUser) => {
        if (currentUser.email === val) {
          // The user is updating their email to the same email they already have
          return Promise.resolve();
        } else {
          // Check if the email is already in use by another user
          return userModel.findOne({ email: val }).then((user) => {
            if (user) {
              return Promise.reject(new Error("E-mail already used"));
            }
            return Promise.resolve();
          });
        }
      });
    }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-MA", "ar-EG"])
    .withMessage("Invalid phone number only accepted MR and EGY "),
  // check("profileImg").optional(),
  // check("role").optional(),
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User ID Format"),
  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter the current password"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirmation"),
  body("password")
    .notEmpty()
    .withMessage("You must enter the new password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom(async (password, { req }) => {
      // 1) verify current password
      const user = await userModel.findById(req.params.id);
      if (!user) {
        throw new Error("There is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }
      // 2) validate new password and password confirmation

      if (password !== req.body.passwordConfirm) {
        throw new Error("Password confirmation incorrect");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User ID Format"),
  validatorMiddleware,
];
