
const pdfParse = require("pdf-parse");

// Skills we want to detect in resumes
const knownSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "React Native",
  "Node.js",
  "Express",
  "MongoDB",
  "MySQL",
  "PostgreSQL",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Redux",
  "Next.js",
  "NestJS",
  "Python",
  "Java",
  "PHP",
  "Laravel",
  "AWS",
  "Firebase",
  "Git",
  "Docker",
  "REST API",
  "GraphQL",
];

const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume.",
      });
    }

    // Extract text from uploaded PDF
    const pdfData = await pdfParse(req.file.buffer);

    const extractedText = pdfData.text.trim();

    if (!extractedText) {
      return res.status(422).json({
        success: false,
        message:
          "No readable text found. This PDF may contain scanned images.",
      });
    }

    // Detect known skills from extracted text
    const detectedSkills = knownSkills.filter((skill) => {
      const escapedSkill = skill.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const regex = new RegExp(
        `\\b${escapedSkill}\\b`,
        "i"
      );

      return regex.test(extractedText);
    });

    return res.status(200).json({
      success: true,
      message: "Resume text extracted successfully.",
      resume: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        totalPages: pdfData.numpages,
        extractedText,
        detectedSkills,
      },
    });
  } catch (error) {
    console.error("Resume analysis error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process the resume.",
    });
  }
};

module.exports = { analyzeResume };
