const express = require("express");
const router = express.Router();

const {
  registerBio,
  verifyRegistrationOfBio,
  createAuthenticationOptionForAttendanceUsingBio,
  verifyAttendance,
  deleteUnregisteredStudent,
} = require("../controllers/studentBio");

router.get("/generate-registration-options", registerBio);
router.post("/verify-registration", verifyRegistrationOfBio);
router.post(
  "/generate-authentication-options",
  createAuthenticationOptionForAttendanceUsingBio
);
router.post("/verify-authentication", verifyAttendance);
router.post("/delete-unregistered-student", deleteUnregisteredStudent);

module.exports = router;
