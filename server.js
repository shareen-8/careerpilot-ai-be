
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const resumeRoutes = require("./routes/resumeRoutes");
const jobRoutes = require("./routes/jobRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CareerPilot AI backend is running!",
  });
});

app.use("/api/resume", resumeRoutes);
app.use("/api/jobs", jobRoutes);
// Handle upload and other API errors
app.use((err, req, res, next) => {
  console.error("API error:", err.message);

  if (err instanceof require("multer").MulterError) {
    return res.status(400).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "File size cannot exceed 5 MB."
          : err.message,
    });
  }

  return res.status(400).json({
    success: false,
    message: err.message || "Something went wrong.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CareerPilot AI backend running on port ${PORT}`);
});
