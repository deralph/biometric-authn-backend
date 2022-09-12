const express = require("express");
const { register, login, getClasses } = require("../controllers/student");
const authorised = require("../middleware/authorise");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/classes-attended", authorised, getClasses);

module.exports = router;
