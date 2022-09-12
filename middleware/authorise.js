const jwt = require("jsonwebtoken");
const unauthorised = require("../errors/unauthorized");

const authorised = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) throw unauthorised("no token provided");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded)
    throw unauthorised("an error occured please try logging in again");
  const { admissionId, email, adminId } = decoded;
  if (admissionId) {
    req.user = { admissionId, email };
  }
  if (adminId) {
    req.user = { adminId, email };
  }
  next();
};

module.exports = authorised;
