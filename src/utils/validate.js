function validatePrediction(input) {
  if (!input || typeof input !== "string") {
    return { valid: false, error: "Prediction is required." };
  }
  const normalized = input.trim().toUpperCase();
  if (normalized !== "YES" && normalized !== "NO") {
    return { valid: false, error: "Prediction must be YES or NO." };
  }
  return { valid: true };
}

function validateMarketUrl(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("polymarket.com")) {
      return { valid: false, error: "URL must be a polymarket.com link." };
    }
    if (!parsed.pathname.includes("/event/")) {
      return { valid: false, error: "URL must be a Polymarket event link." };
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Invalid URL." };
  }
}

module.exports = {
  validatePrediction,
  validateMarketUrl
};
