const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  analyzeSingleResume,
  analyzeMultipleResumes,
} = require("../controllers/analyzeController");

// Single file upload route
router.post("/", upload.single("resume"), analyzeSingleResume);

// Multiple files upload route
router.post("/multiple", upload.array("resumes", 50), analyzeMultipleResumes);

module.exports = router;
