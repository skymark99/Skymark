const AppError = require("./appError");

const sendErr = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    isOperational: err.isOperational,
    error: err,
  });
};

const handleInvalidId = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateDB = (err) => {
  const value = err.errmsg.match(/"([^"]*)"/);
  const message = `Duplicate field value ${
    value?.[0] ? value[0] : "Found"
  }. Please use anothor value`;
  return new AppError(message, 400);
};

const handleValidationDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJsonInvalidToken = (err) => {
  return new AppError("Invalid Token Please login again", 401);
};

module.exports = function globalErrorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.isOperational = err.isOperational || false;

  console.log(err, "Hitting error handler");

  //   catching invalid id
  if (err.name === "CastError") err = handleInvalidId(err);

  //Catching duplicate Fields
  if (err.code === 11000) err = handleDuplicateDB(err);
  else if (err.name === "MongoServerError") err = handleDuplicateDB(err);

  //handle validationError
  if (err.name === "ValidationError") err = handleValidationDB(err);

  //invalid token
  if (err.name === "JsonWebTokenError") err = handleJsonInvalidToken(err);

  sendErr(err, res);
};
