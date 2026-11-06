
const { searchJobs } = require("../services/jobSearchService");

const getJobs = async (req, res) => {
  try {
    const {
      keyword = "",
      location = "",
      jobType = "",
      page = 1,
    } = req.query;

    if (
      typeof keyword !== "string" ||
      typeof location !== "string" ||
      typeof jobType !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid search filters.",
      });
    }

    if (
      keyword.length > 100 ||
      location.length > 100 ||
      jobType.length > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Search filters are too long.",
      });
    }

    const result = await searchJobs({
      keyword,
      location,
      jobType,
      page,
    });

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully.",
      ...result,
    });
  } catch (error) {
    console.error("JSearch error:", error);

    const isTimeout =
      error.name === "TimeoutError" ||
      error.name === "AbortError";

    return res.status(isTimeout ? 504 : 502).json({
      success: false,
      message: isTimeout
        ? "JSearch took too long to respond. Please try again."
        : error.message || "Unable to fetch jobs right now.",
    });
  }
};

module.exports = { getJobs };
