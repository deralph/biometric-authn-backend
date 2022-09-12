const badRequest = require("../errors/badRequest");
const Class = require("../model/classes");

const createClasses = async (req, res) => {
  const { email } = req.user;
  const body = req.body;
  const _class = await Class.create(body);
  if (!_class) throw new badRequest("please fill all inputs");
  res.status(200).json({ sucess: true, createdBy: email });
};

const getClasses = async (req, res) => {
  const { email } = req.user;
  const classes = await Class.find({});
  if (!classes) throw new badRequest("an error ocured please try again");
  req.status(200).json({ classes, count: classes.length, requestedBy: email });
};
const closeClass = async (req, res) => {
  const { id } = req.params;
  const { email } = req.user;
  const classes = await Class.findOneAndUpdate(
    { _id: id },
    { closed: true },
    { new: true, runValidators: true }
  );
  if (!classes) throw new badRequest("an error ocured please try again");
  req.status(200).json({ classes, count: classes.length, requestedBy: email });
};

module.exports = { createClasses, getClasses, closeClass };
