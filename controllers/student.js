const { StatusCodes } = require("http-status-codes");
const badRequest = require("../errors/badRequest");
const User = require("../model/Student");
const Student = require("../model/studentBio");

const register = async (req, res) => {
  //   const { admissionId, email } = req.body;
  //   if (!admissionId || !email) {
  //     throw new badRequest("no admissionId and email available");
  //   }
  //   const checkIfPresent = await User.findOne({ admissionId });
  const user = await User.create(req.body);
  const token = user.createJWT();

  res
    .status(StatusCodes.ACCEPTED)
    .cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV == "development",
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 1000,
    })
    .json({ username: user.email, isPosted: true, sucess: true });
  res
    .status(StatusCodes.ACCEPTED)
    .cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV == "development",
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 1000,
    })
    .json({ username: user.email, isPosted: true, sucess: true });
};

const login = async (req, res) => {
  const { admissionId, email } = req.body;
  const user = await User.findOne({ admissionId, email });
  if (!user) {
    throw new badRequest("invalid admissionId or email");
  }
  const token = user.createJWT();
  res
    .status(StatusCodes.ACCEPTED)
    .cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV == "development",
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 1000,
    })
    .json({ username: user.email, isPosted: true, sucess: true });
};

const getClasses = async (req, res) => {
  const { admissionId, email } = req.user;
  const attendance = Student.findOne({ admissionId, email });
  if (!attendance)
    throw new badRequest("an error occured please try logging in again");
  res.status(200).json({ attendance, count: attendance.length });
};

module.exports = { register, login, getClasses };
