const express = require("express");
const router = express.Router();
const resellerController = require("../controllers/resellerController");

router.get("/", resellerController.getResellers);
router.post("/", resellerController.createReseller);
router.put("/:id", resellerController.updateReseller);
router.delete("/:id", resellerController.deleteReseller);

module.exports = router;
