const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

const {
  analyzeResume,
} = require("../controllers/resumeController");

const {
  aiAnalyzeResume,
} = require("../controllers/aiResumeController");

// PDF upload and text extraction
router.post(
  "/analyze",
  upload.single("resume"),
  analyzeResume
);

// Parse JSON specifically for the AI endpoint
router.post(
  "/ai-analyze",
  express.json(),
  aiAnalyzeResume
);

module.exports = router;