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
  },
  registered: {
    type: Boolean,
    default: false,
  },
  credentialID: {
    type: Buffer,
  },
  credentialPublicKey: {
    type: Buffer,
  },
  counter: {
    type: Number,
  },
});

module.exports = mongoose.model("users", userSchema);
