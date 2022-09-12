const Mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const adminSchema = new Mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

adminSchema.methods.creatJWT = async function () {
  const token = jwt.sign(
    { adminId: this.adminId, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
  return token;
};

module.exports = Mongoose.model("admin", adminSchema);
