const express = require("express");
const {
  register,
  verifyRegistration,
  login,
  verifyLogin,
} = require("../controllers/user");
const router = express.Router();

router.post("/generate-registration-options", register);
router.post("/verify-registration", verifyRegistration);
router.post("/generate-authentication-options", login);
router.post("/verify-authentication", verifyLogin);

module.exports = router;
