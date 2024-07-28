const express = require("express");

const authcontroller = require("../controllers/authcontroller");

const {
  addAddress,
  RemoveAddress,
  getAddresses,
} = require("../controllers/addressController");

const {
  createAddressValidator,
} = require("../utils/validators/addressesValidator");

const router = express.Router();

router.use(authcontroller.protect, authcontroller.allowedTo("user"));

router.route("/").post(createAddressValidator, addAddress).get(getAddresses);

router.route("/:addressId").delete(RemoveAddress);

module.exports = router;
