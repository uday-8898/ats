const express = require("express");
const router = express.Router();
const commController = require("../controllers/commController");

// Route for text processing
router.post("/comm", express.json(), commController);

module.exports = router;
