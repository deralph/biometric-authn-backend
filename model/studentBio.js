const mongoose = require("mongoose");

const userBioSchema = new mongoose.Schema({
  admissionId: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  registered: {
    type: Boolean,
    default: false,
  },
  // credentialID: {
  //   type: Buffer,
  // },
  // credentialPublicKey: {
  //   type: Buffer,
  // },
  // counter: {
  //   type: Number,
  // },
  authenticators: [],
  attended: [],
});

module.exports = mongoose.model("student-attendance-bio", userBioSchema);
