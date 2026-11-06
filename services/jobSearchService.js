
// const API_URL = "https://jsearch.p.rapidapi.com/search";
const API_URL = "https://jsearch.p.rapidapi.com/search-v2";

const normalizeJob = (job) => {
  const locationParts = [
    job.job_city,
    job.job_state,
    job.job_country,
  ].filter(Boolean);

  return {
    id: String(job.job_id || ""),
    title: job.job_title || "Untitled position",
    company: job.employer_name || "Company not specified",
    location:
      job.job_location ||
      locationParts.join(", ") ||
      "Location not specified",
    country: job.job_country || "",
    category: job.job_category || "",
    jobType: job.job_employment_type || "",
    salary:
      job.job_salary ||
      (job.job_min_salary || job.job_max_salary
        ? `${job.job_min_salary || "?"} - ${job.job_max_salary || "?"} ${job.job_salary_currency || ""}`
        : ""),
    description: job.job_description || "",
    url: job.job_apply_link || job.job_google_link || "",
    postedAt:
      job.job_posted_at_datetime_utc ||
      job.job_posted_at ||
      "",
    source: job.job_publisher || "JSearch",
    isRemote: Boolean(job.job_is_remote),
    employerLogo: job.employer_logo || "",
  };
};

const searchJobs = async ({
  keyword = "",
  location = "",
  jobType = "",
  page = 1,
  limit = 10,
}) => {
  const apiKey = process.env.JSEARCH_API_KEY;

  if (!apiKey) {
    throw new Error(
      "JSEARCH_API_KEY is missing. Add it to the backend .env file."
    );
  }

  const safePage = Math.max(1, Number(page) || 1);

  // JSearch returns up to 10 jobs per page.
  // One page per request helps conserve the free API quota.
  const safeLimit = 10;

  const searchTerms = keyword.trim() || "software developer";

  const searchQuery = location.trim()
    ? `${searchTerms} jobs in ${location.trim()}`
    : `${searchTerms} jobs in United Arab Emirates`;

  const params = new URLSearchParams({
    query: searchQuery,
    page: String(safePage),
    num_pages: "1",
    country: "ae",
  });

  const response = await fetch(`${API_URL}?${params.toString()}`, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(30000),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const providerMessage =
      payload?.error?.message ||
      payload?.message ||
      `JSearch returned HTTP ${response.status}.`;

    throw new Error(providerMessage);
  }

  if (payload.status === "ERROR") {
    throw new Error(
      payload.error?.message || "JSearch could not complete the search."
    );
  }

  const rawJobs = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.data?.jobs)
      ? payload.data.jobs
      : [];

  let jobs = rawJobs.map(normalizeJob);

  // Apply the employment type filter locally.
  if (jobType.trim()) {
    const typeTerm = jobType.trim().toLowerCase();

    jobs = jobs.filter((job) =>
      job.jobType.toLowerCase().includes(typeTerm)
    );
  }

  return {
    jobs,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: null,
      returned: jobs.length,
      nextPage: jobs.length === safeLimit ? safePage + 1 : null,
    },
    provider: "JSearch",
    searchQuery,
  };
};

module.exports = { searchJobs };
