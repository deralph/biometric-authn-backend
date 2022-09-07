const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  admissionId: {
    type: String,
    required: true,
    trim: true,
    // unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    // unique: true,
  },
  // userId: {
  //   type: String,
  //   required: true,
  // },
  registered: {
    type: Boolean,
    default: false,
  },
  authenticators: [],
});

module.exports = mongoose.model("users", userSchema);
