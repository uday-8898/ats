const express = require('express');
const { createResume } = require('../controllers/createResume');
const router = express.Router();

// POST route for form data handling
router.post('/submit', createResume);

module.exports = router;
