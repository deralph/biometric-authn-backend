const { default: mongoose } = require("mongoose");
const Mongoose = require("mongoose");

const classesSchema = new Mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    teacher: {
      type: String,
      required: true,
    },
    // date: {
    //   type: Date,
    //   required: true,
    // },
    course_code: {
      type: String,
      required: true,
    },
    class_code: {
      type: String,
      required: true,
    },
    closed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("classes", classesSchema);
