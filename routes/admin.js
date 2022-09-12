const express = require("express");
const { getStudentAttendance, setAdmin } = require("../controllers/admin");
const authorised = require("../middleware/authorise");
const router = express.Router();

router.get("/students", authorised, getStudentAttendance);
router.post("/", setAdmin);

module.exports = router;
