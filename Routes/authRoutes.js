const express = require("express");
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

router.route("/forgotPassword").post(forgotPassword);
router.route("/verifyResetCode").post(verifyPassResetCode);
router.route("/resetPassword").put(resetPassword);

module.exports = router;
