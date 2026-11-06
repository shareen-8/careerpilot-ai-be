const express = require("express");
const router = express.Router();

const { getJobs } = require("../controllers/jobController");
const { matchJobs } = require("../controllers/jobMatchController");

// Search live jobs
router.get("/search", getJobs);

// Match jobs against resume
router.post(
  "/match",
  express.json(),
  matchJobs
);

module.exports = router;