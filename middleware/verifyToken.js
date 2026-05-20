const jwt = require("jsonwebtoken");

function readBearerOrCookie(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

const verifyToken = async (req, res, next) => {
  const token = readBearerOrCookie(req);

  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Unauthorized - no token provided",
      });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });
    }

    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    console.log("Error in verifying token", error);
    res.status(401).json({
      success: false,
      message: "Unauthorized - invalid or expired token",
    });
  }
};

module.exports = { verifyToken };
