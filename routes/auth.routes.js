const express = require("express");
const passport = require("passport");
const {
  signup,
  verifyEmail,
  logout,
  login,
  forgotPassword,
  resetPassword,
  getUserProfile,
  resendVerification,
  updateProfile,
} = require("../controllers/auth-controllers");

const { verifyToken } = require("../middleware/verifyToken.js");

const route = express.Router();

route.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

route.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const { token, user } = req.user;
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(
      `${process.env.CLIENT_URL}?user=${encodeURIComponent(JSON.stringify(user))}`,
    );
  },
);

route.post("/signup", signup);
route.post("/login", login);
route.get("/logout", logout);

route.post("/verify-email", verifyToken, verifyEmail);
route.post("/resend-verification", verifyToken, resendVerification);
route.post("/forgot-password", forgotPassword);
route.post("/reset-password/:token", resetPassword);

route.get("/profile", verifyToken, getUserProfile);
route.post("/update-profile", verifyToken, updateProfile);

module.exports = route;
