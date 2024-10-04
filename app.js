const express = require("express");
const cors = require("cors");
const app = express();
const compression = require("compression");
const AppError = require("./Utilities/appError");
const versionOne = require("./versions/v1");
const globalErrorHandler = require("./Utilities/globalErrorhandler");
const cookieParser = require("cookie-parser");

app.use(compression({ threshold: 512 })); // Compress only responses larger than 512 bytes

app.use(cookieParser());

const allowedOrigins = [
  "https://accounting-software-kappa.vercel.apps",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/v1", versionOne);

app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find the ${req.originalUrl} on the page !`, 404));
});

// hangling every error in the entire application server never going to down
app.use(globalErrorHandler);

module.exports = app;
