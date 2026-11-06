const { matchJobsToResume } = require("../services/jobMatchService");

const matchJobs = (req, res) => {
  try {
    const { resumeText, jobs } = req.body;

    if (!resumeText || typeof resumeText !== "string") {
      return res.status(400).json({
        success: false,
        message: "Resume text is required.",
      });
    }

    if (resumeText.length < 50) {
      return res.status(400).json({
        success: false,
        message: "Resume text is too short to analyze.",
      });
    }

    if (resumeText.length > 30000) {
      return res.status(400).json({
        success: false,
        message: "Resume text cannot exceed 30,000 characters.",
      });
    }

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one job to compare.",
      });
    }

    if (jobs.length > 30) {
      return res.status(400).json({
        success: false,
        message: "You can compare up to 30 jobs at a time.",
      });
    }

    const invalidJob = jobs.some(
      (job) =>
        !job ||
        typeof job !== "object" ||
        typeof job.description !== "string"
    );

    if (invalidJob) {
      return res.status(400).json({
        success: false,
        message: "Every job must include a description.",
      });
    }

    const matches = matchJobsToResume(resumeText, jobs);

    return res.status(200).json({
      success: true,
      message: "Job matching completed successfully.",
      totalJobs: matches.length,
      matches,
    });
  } catch (error) {
    console.error("Job matching error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to match jobs at the moment.",
    });
  }
};

module.exports = { matchJobs };