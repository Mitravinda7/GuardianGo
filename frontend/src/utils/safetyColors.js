export const getSafetyColor = (severity) => {
  switch (severity) {
    case 'low': return '#27AE60';
    case 'medium': return '#F2994A';
    case 'high': return '#E74C3C';
    default: return '#27AE60';
  }
};

export const getZoneColor = (score) => {
  if (score >= 8) return '#27AE60';
  if (score >= 5) return '#F2994A';
  return '#E74C3C';
};

export const getZoneLabel = (score) => {
  if (score >= 8) return 'Safe Zone';
  if (score >= 5) return 'Warning Zone';
  return 'Danger Zone';
};

export const getSeverityBadgeStyle = (severity) => {
  const styles = {
    low: { background: '#D4EDDA', color: '#27AE60', border: '1px solid #27AE60' },
    medium: { background: '#FFF3CD', color: '#F2994A', border: '1px solid #F2994A' },
    high: { background: '#F8D7DA', color: '#E74C3C', border: '1px solid #E74C3C' },
  };
  return styles[severity] || styles.low;
};