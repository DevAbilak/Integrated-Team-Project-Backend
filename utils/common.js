const formatResponse = (user) => {
  const userResponse = { ...user._doc };
  delete userResponse.password;
  if (userResponse.role !== "operator") {
    delete userResponse.operatorDetails;
  }
  return userResponse;
};

module.exports = { formatResponse };
