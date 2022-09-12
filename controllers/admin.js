const badRequest = require("../errors/badRequest");
const unauthorised = require("../errors/unauthorized");
const Students = require("../model/studentBio");
const Admin = require("../model/admin");

const setAdmin = async (req, res) => {
  const { adminId, email } = req.body;
  if (!adminId || !email)
    throw new unauthorised("please input your email and id");
  const admin = await Admin.findOne({ adminId, email });
  if (!admin)
    throw new badRequest("an error occured please try repeating the process");

  const token = admin.createJWT();

  res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV == "development",
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 1000,
    })
    .json({ username: user.email, isPosted: true, sucess: true });
};

const getStudentAttendance = async (req, res) => {
  const { email } = req.user;
  const student = await Students.find({});
  if (!student)
    throw new badRequest("an issue occured kindly repeat the process");
  res.status(200).json({ student, count: student.length, requestedBy: email });
};

module.exports = { getStudentAttendance, setAdmin };
