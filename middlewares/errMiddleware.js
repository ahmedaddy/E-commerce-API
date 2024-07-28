const ApiError = require("../utils/apiError");

const sendErrorForDeveloper = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProduction = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const handleJWTInvalidSignture = () =>
  new ApiError("Invalid token please log in again..", 401);

const handleJWTexpired = () =>
  new ApiError("Expired token please log in again..", 401);

const globalError = (err, req, res, next) => {
  // Send error response as a with 400 status
  err.statusCode = err.statusCode || 500;
  // console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    sendErrorForDeveloper(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handleJWTInvalidSignture();
    if (err.name === "TokenExpiredError") err = handleJWTexpired();
    sendErrorForProduction(err, res);
  }
};
module.exports = globalError;
