/* eslint-disable import/no-extraneous-dependencies */
const rateLimit = require("express-rate-limit");

const accountCreationLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS,
  limit: process.env.RATE_LIMIT_MAX,
  message: "Too many accounts created from this IP, try again after an hour",
});

module.exports = accountCreationLimiter;
