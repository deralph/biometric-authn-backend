const express = require("express");
const app = express();

const cookieSession = require("cookie-session");
const session = require("express-session");
var RedisStore = require("connect-redis")(session);

const cors = require("cors");
const xss = require("xss-clean");
const helmet = require("helmet");

const connectDB = require("./connect db/connect");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const registerRouter = require("./routes/user");

require("express-async-errors");
require("dotenv").config();

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND,
    methods: ["GET", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["content-type", "Authorization", "x-csrf-token", "cookie"],
    credentials: true,
    optionSuccessStatus: 200,
  })
);
// app.use(
//   cookieSession({
//     name: "session",
//     keys: "1234567890",

//     // Cookie Options
//     maxAge: 24 * 60 * 60 * 1000, // 24 hours
//   })
// );
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "thedogsleepsatnight",
    // store: new RedisStore(),
  })
);

app.use(helmet());
app.use(xss());

app.use("/api/v1", (req, res) => {
  res.status(200).send("home page");
});
app.use("/", registerRouter);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    const port = 5000;
    app.listen(port, () => console.log(`server listening at port ${port}`));
  } catch (error) {
    console.log(error);
  }
};
start();
