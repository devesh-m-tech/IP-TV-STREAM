const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Middlewares
const verifyJwt = require("../middlewares/verifyJwt");   // JWT token verification
const verifyAdmin = require("../middlewares/verifyAdmin"); // Admin role check

// Public route: User login
router.post("/login", authController.login);

// Protected route: User logout (requires valid JWT)
router.post("/logout", verifyJwt, authController.logout);

// Protected route: Get user profile (requires valid JWT)
router.get("/profile", verifyJwt, authController.profile);

// Protected route: Admin-only example
router.get("/admin", verifyJwt, verifyAdmin, authController.adminDashboard);

module.exports = router;
