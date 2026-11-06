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
    "Mongoose",
    "Redis",
    "Jest",
    "Cypress",
    "Vue.js",
    "Angular",
    "Bootstrap",
    "Material UI",
  ];
  
  const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
  const detectSkills = (text = "") => {
    const normalizedText = text.toLowerCase();
  
    return knownSkills.filter((skill) => {
      const pattern = new RegExp(
        `(^|[^a-z0-9+#.])${escapeRegex(skill.toLowerCase())}([^a-z0-9+#.]|$)`,
        "i"
      );
  
      return pattern.test(normalizedText);
    });
  };
  
  // Only detects experience explicitly stated in the text.
  // It does not calculate years from employment dates.
  const detectExperienceYears = (text = "") => {
    const rangeMatch = text.match(
      /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*\+?\s*years?/i
    );
  
    if (rangeMatch) {
      return Number(rangeMatch[1]);
    }
  
    const singleMatch = text.match(
      /(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?(?:professional\s+)?experience/i
    );
  
    if (singleMatch) {
      return Number(singleMatch[1]);
    }
  
    return null;
  };
  
  const detectRequiredExperience = (text = "") => {
    const rangeMatch = text.match(
      /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*\+?\s*years?/i
    );
  
    if (rangeMatch) {
      return {
        minimum: Number(rangeMatch[1]),
        maximum: Number(rangeMatch[2]),
      };
    }
  
    const minimumMatch = text.match(
      /(?:minimum|min\.?|at least)\s*(\d+(?:\.\d+)?)\s*\+?\s*years?/i
    );
  
    if (minimumMatch) {
      return {
        minimum: Number(minimumMatch[1]),
        maximum: null,
      };
    }
  
    const singleMatch = text.match(
      /(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?(?:relevant\s+)?experience/i
    );
  
    if (singleMatch) {
      return {
        minimum: Number(singleMatch[1]),
        maximum: null,
      };
    }
  
    return null;
  };
  
  const calculateJobMatch = (resumeText, job) => {
    const jobText = `${job.title || ""} ${job.description || ""}`;
  
    const resumeSkills = detectSkills(resumeText);
    const requiredSkills = detectSkills(jobText);
  
    const matchedSkills = requiredSkills.filter((skill) =>
      resumeSkills.includes(skill)
    );
  
    const missingSkills = requiredSkills.filter(
      (skill) => !resumeSkills.includes(skill)
    );
  
    const skillScore =
      requiredSkills.length > 0
        ? (matchedSkills.length / requiredSkills.length) * 80
        : null;
  
    const candidateExperience = detectExperienceYears(resumeText);
    const requiredExperience = detectRequiredExperience(jobText);
  
    let experienceScore = null;
    let experienceStatus = "Not enough information";
  
    if (
      candidateExperience !== null &&
      requiredExperience !== null
    ) {
      const minimumYears = requiredExperience.minimum;
  
      experienceScore =
        candidateExperience >= minimumYears
          ? 20
          : (candidateExperience / minimumYears) * 20;
  
      experienceStatus =
        candidateExperience >= minimumYears
          ? "Meets the stated minimum experience"
          : "Below the stated minimum experience";
    } else if (requiredExperience && candidateExperience === null) {
      experienceStatus = "Resume does not explicitly state total experience";
    } else if (!requiredExperience) {
      experienceStatus = "Job does not clearly state required experience";
    }
  
    // Use only components for which both sides have usable information.
    let score = null;
    let scoreBasis = [];
  
    if (skillScore !== null && experienceScore !== null) {
      score = skillScore + experienceScore;
      scoreBasis = ["Skills (80%)", "Experience (20%)"];
    } else if (skillScore !== null) {
      score = (skillScore / 80) * 100;
      scoreBasis = ["Skills only"];
    } else if (experienceScore !== null) {
      score = (experienceScore / 20) * 100;
      scoreBasis = ["Experience only"];
    }
  
    if (score !== null) {
      score = Math.round(Math.min(100, Math.max(0, score)));
    }
  
    let matchLevel = "Insufficient information";
  
    if (score !== null) {
      if (score >= 80) matchLevel = "Strong match";
      else if (score >= 60) matchLevel = "Good match";
      else if (score >= 40) matchLevel = "Partial match";
      else matchLevel = "Low match";
    }
  
    return {
      jobId: job.id || null,
      title: job.title || "Untitled job",
      company: job.company || "Unknown company",
      score,
      matchLevel,
      scoreBasis,
      skills: {
        resumeSkills,
        requiredSkills,
        matchedSkills,
        missingSkills,
        totalRequired: requiredSkills.length,
        totalMatched: matchedSkills.length,
      },
      experience: {
        candidateYears: candidateExperience,
        requiredMinimumYears: requiredExperience?.minimum ?? null,
        requiredMaximumYears: requiredExperience?.maximum ?? null,
        status: experienceStatus,
      },
      explanation:
        score === null
          ? "There is not enough information in the resume and job description to calculate a reliable match score."
          : `The score is based on ${scoreBasis.join(" and ").toLowerCase()}. ${matchedSkills.length} of ${requiredSkills.length} detected job skills match the resume.`,
    };
  };
  
  const matchJobsToResume = (resumeText, jobs) => {
    return jobs.map((job) => calculateJobMatch(resumeText, job));
  };
  
  module.exports = {
    matchJobsToResume,
  };