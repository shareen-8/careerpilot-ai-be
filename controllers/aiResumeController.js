const {
    analyzeResumeWithGemini,
  } = require("../services/geminiService");
  
  const aiAnalyzeResume = async (req, res) => {
    try {
    //   const { extractedText } = req.body;
    const { extractedText } = req.body || {};
  
      if (!extractedText || typeof extractedText !== "string") {
        return res.status(400).json({
          success: false,
          message: "Resume text is required.",
        });
      }
  
      if (extractedText.trim().length < 50) {
        return res.status(400).json({
          success: false,
          message: "Please provide more resume text for analysis.",
        });
      }
  
      if (extractedText.length > 30000) {
        return res.status(413).json({
          success: false,
          message: "Resume text is too long to analyze.",
        });
      }
  
      const analysis = await analyzeResumeWithGemini(extractedText);
  
      return res.status(200).json({
        success: true,
        message: "AI resume analysis completed successfully.",
        analysis,
      });
    } catch (error) {
      console.error("AI resume analysis error:", error);
  
      return res.status(500).json({
        success: false,
        message:
          error.message || "Unable to analyze the resume using AI.",
      });
    }
  };
  
  module.exports = { aiAnalyzeResume };