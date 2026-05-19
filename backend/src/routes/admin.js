const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const deviceController = require("../controllers/deviceController");

// Admin login
router.post("/login", adminController.login);

// Create user
router.post("/users", adminController.createUser);

// List all users
router.get("/users", adminController.getUsers);

// Update user (by ID)
router.put("/users/:id", adminController.updateUser);

// Delete user (by ID)
router.delete("/users/:id", adminController.deleteUser);

//devices for a user
router.get("/users/:id/devices", deviceController.getDevicesByUser);

// Revoke device
router.delete("/users/:id/devices/:deviceId", deviceController.revokeDevice);

module.exports = router;
