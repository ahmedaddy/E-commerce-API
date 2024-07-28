// class apiError extends Error {
//   constructor(message, statusCode) {
//     super(message);
//     this.statusCode = statusCode;
//     this.status = `${statusCode}`.startsWith(4) ? "fail" : "error";
//     this.isOperational = true;
//   }
// }
// @desk     this function is responsible about operational errors
function apiError(message, statusCode) {
  // Create new Error with message
  const error = new Error(message);

  // Set error status code
  error.statusCode = statusCode;

  // Set error status as fail or error
  error.status = `${statusCode}`.startsWith(4) ? "fail" : "error";

  // Mark error as operational
  error.isOperational = true;

  // Return created error
  return error;
}
module.exports = apiError;
