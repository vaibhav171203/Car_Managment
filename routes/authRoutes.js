const express = require("express");
const { register, login } = require("../controllers/authController");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for user authentication
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: SecurePass123
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: johndoe@example.com
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       400:
 *         description: Bad request (missing fields or invalid data)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: SecurePass123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Unauthorized (invalid credentials)
 *       500:
 *         description: Server error
 */

router.post("/register", register);
router.post("/login", login);

module.exports = router;
