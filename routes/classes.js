const express = require("express");
const {
  createClasses,
  getClasses,
  closeClass,
} = require("../controllers/classes");
const router = express.Router();

router.post("/", createClasses);
router.get("/", getClasses);
router.patch("/close-class/:id", closeClass);

module.exports = router;
