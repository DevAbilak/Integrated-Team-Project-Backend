const express = require("express");
const { verifyToken } = require("../middleware/verifyToken");
const {
  getUserProfile,
  updateProfile,
} = require("../controllers/user-controllers");

const route = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management (authenticated)
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get the profile of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated (invalid or missing token)
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update the profile of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: "John Updated"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: New password (min 6 characters)
 *                 example: "newStrongPass123"
 *               operatorDetails:
 *                 type: object
 *                 description: Only allowed for users with role 'operator'
 *                 properties:
 *                   businessName:
 *                     type: string
 *                     example: "John's Tours PLC"
 *                   licenseNumber:
 *                     type: string
 *                     example: "LIC-2024-00123"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Profile updated"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error (e.g., invalid email, password too short)
 *       401:
 *         description: Not authenticated
 */

route.get("/profile", verifyToken, getUserProfile);
route.put("/profile", verifyToken, updateProfile);

module.exports = route;
