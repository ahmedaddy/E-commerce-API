const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createAddressValidator = [
  check("details").notEmpty().withMessage("Details field required"),
  check("alias").notEmpty().withMessage("Alias field required"),
  check("phone")
    .isMobilePhone(["ar-MA", "ar-EG"])
    .withMessage("Invalid phone number only accepted MR and EGY "),
  check("city").notEmpty().withMessage("City field required"),
  check("postalCode")
    .isPostalCode("any")
    .withMessage("Postal Code is not correct"),
  validatorMiddleware,
];
