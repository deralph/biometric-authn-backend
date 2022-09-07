const express = require("express");
const { register, verifyRegistration } = require("../controllers/user");
const router = express.Router();

router.post("/generate-registration-options", register);
router.post("/verify-registration", verifyRegistration);

module.exports = router;
