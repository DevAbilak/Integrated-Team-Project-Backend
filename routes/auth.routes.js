const express = require("express");
const passport = require("passport");
const {
  signup,
  verifyEmail,
  logout,
  login,
  forgotPassword,
  resetPassword,
  resendVerification,
} = require("../controllers/auth-controllers");

const { verifyToken } = require("../middleware/verifyToken.js");
const upload = require("../middleware/upload.js");

const route = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Registration and login endpoints
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user (traveler or operator) with optional certificate file for operators
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Unique email address
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password (min 6 characters)
 *                 example: "secret123"
 *               role:
 *                 type: string
 *                 enum: [traveler, operator]
 *                 default: traveler
 *                 description: User role. Operators must also provide businessName and certificate.
 *               businessName:
 *                 type: string
 *                 description: Required if role is 'operator'
 *                 example: "John's Ethiopia Tours"
 *               licenseNumber:
 *                 type: string
 *                 description: Optional license number for operators
 *                 example: "LIC-2024-00123"
 *               certificate:
 *                 type: string
 *                 format: binary
 *                 description: Business certificate file (image or PDF). Required if role is 'operator'.
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error, missing required fields (e.g., certificate for operator), or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error (e.g., certificate upload failure)
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "secret123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth login (redirects to Google)
 *     tags: [Authentication]
 *     description: |
 *       Redirects the user to Google's consent screen.
 *       After successful authentication, Google redirects to `/auth/google/callback`.
 *     responses:
 *       302:
 *         description: Redirect to Google
 */

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback endpoint
 *     tags: [Authentication]
 *     description: |
 *       Google redirects here after user consents.
 *       This endpoint exchanges the authorization code for user info,
 *       creates/updates a user in your database, and returns a JWT token.
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Authorization code from Google
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         description: Error message if user denied access
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       400:
 *         description: Missing code or OAuth error
 */

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Log out the current user
 *     tags: [Authentication]
 *     description: |
 *       Invalidates the JWT token (optional – if you implement token blacklist).
 *       For a stateless JWT implementation, the client simply discards the token.
 *       This endpoint is provided for API completeness.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify user email address
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Email verified successfully. You can now log in."
 *       400:
 *         description: Invalid or expired token / user already verified
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend email verification code (unauthenticated)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Verification email sent (if email exists)
 *       400:
 *         description: Email already verified or invalid
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent (if email exists in system)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "If that email address is registered, you will receive a password reset link shortly."
 *       400:
 *         description: Invalid email format or missing email field
 *       500:
 *         description: Failed to send reset email
 */

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using a valid reset token (token in URL path)
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Reset token received via email
 *         example: "a1b2c3d4e5f67890abcdef1234567890"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: New password (min 6 characters)
 *                 example: "newSecurePass123"
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Password has been reset. You can now log in with your new password."
 *       400:
 *         description: Invalid or expired token, or password validation failed
 *       404:
 *         description: User not found associated with token
 *       500:
 *         description: Server error
 */

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
    failureRedirect: "/api/auth/signup",
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

route.post("/signup", upload.single("certificate"), signup);
route.post("/login", login);
route.get("/logout", logout);

route.post("/verify-email", verifyToken, verifyEmail);
route.post("/resend-verification", verifyToken, resendVerification);
route.post("/forgot-password", forgotPassword);
route.post("/reset-password/:token", resetPassword);

module.exports = route;
