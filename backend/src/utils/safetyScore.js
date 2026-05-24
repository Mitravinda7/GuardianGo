export const calculateSafetyScore = (reports) => {
  if (!reports || reports.length === 0) return 10;
  let score = 10;
  reports.forEach((r) => {
    if (r.severity === 'high') score -= 2;
    else if (r.severity === 'medium') score -= 1;
    else score -= 0.5;
  });
  return Math.max(1, Math.round(score));
};

export const getScoreColor = (score) => {
  if (score >= 8) return '#27AE60';
  if (score >= 5) return '#F2994A';
  return '#E74C3C';
};

export const getScoreLabel = (score) => {
  if (score >= 8) return 'Safe';
  if (score >= 5) return 'Moderate';
  return 'Dangerous';
};