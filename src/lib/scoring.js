function computeBasePoints({ oddsAtPrediction, isCorrect }) {
  if (typeof oddsAtPrediction !== "number") return 0;
  if (isCorrect) return 100 - oddsAtPrediction;
  return -oddsAtPrediction;
}

function computeMultiplier(confidence) {
  if (typeof confidence !== "number") return 1;
  return 1 + (confidence - 50) / 50;
}

function computeFinalPoints({ oddsAtPrediction, isCorrect, confidence }) {
  const base = computeBasePoints({ oddsAtPrediction, isCorrect });
  const multiplier = computeMultiplier(confidence);
  return Number((base * multiplier).toFixed(2));
}

module.exports = {
  computeBasePoints,
  computeMultiplier,
  computeFinalPoints
};
