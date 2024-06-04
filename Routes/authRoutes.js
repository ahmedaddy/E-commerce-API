const express = require("express");
const accountCreationLimiter = require("../utils/rateLimiter");

const {
  signupValidator,
  loginValidator,
} = require("../utils/validators/authValidator");

const {
  signUp,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} = require("../controllers/authcontroller");

const router = express.Router();

router.route("/signup").post(signupValidator, signUp);
router.route("/login").post(loginValidator, login);

router.use(accountCreationLimiter);

router.route("/forgotPassword").post(accountCreationLimiter, forgotPassword);
router
  .route("/verifyResetCode")
  .post(accountCreationLimiter, verifyPassResetCode);
router.route("/resetPassword").put(accountCreationLimiter, resetPassword);

module.exports = router;
