exports.sanitizeUser = function (user) {
  return {
    _id: user._id,
    username: user.name,
    email: user.email,
    phone: user.phone,
  };
};
