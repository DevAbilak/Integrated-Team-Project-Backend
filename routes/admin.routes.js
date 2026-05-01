const express = require("express");
const {
  getAllUsers,
  verifyOperator,
} = require("../controllers/admin-controllers");
const { verifyToken } = require("../middleware/verifyToken");
const { isAdmin } = require("../middleware/isAdmin");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin operation endpoints
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (admin only) with pagination and role filtering
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [traveler, operator, admin]
 *         description: Filter users by role
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: List of users with pagination metadata
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       403:
 *         description: Forbidden – admin access required
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/admin/users/{userId}/verify-operator:
 *   put:
 *     summary: Verify an operator (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId of the operator to verify
 *         example: "60d5f9f8b8e5a72d4c8e4e3a"
 *     responses:
 *       200:
 *         description: Operator verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Operator verified successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: User is not an operator or already verified
 *       403:
 *         description: Forbidden – admin access required
 *       404:
 *         description: User not found
 *       401:
 *         description: Not authenticated
 */

router.get("/users", verifyToken, isAdmin, getAllUsers);
router.put("/users/:id/verify-operator", verifyToken, isAdmin, verifyOperator);

module.exports = router;
