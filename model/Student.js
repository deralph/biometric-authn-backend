const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const studentSchema = new mongoose.Schema({
  admissionId: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
});

studentSchema.methods.createJWT = function () {
  const token = jwt.sign(
    { admissionId: this.admissionId, email: this.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );

  return token;
};

module.exports = mongoose.model("students", studentSchema);
