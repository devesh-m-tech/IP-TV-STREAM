const express = require("express");
const router = express.Router();
const revenueController = require("../controllers/revenueController");

router.get("/transactions", revenueController.getTransactions);
router.get("/stats", revenueController.getRevenueStats);
router.post("/transactions", revenueController.createTransaction);

module.exports = router;
