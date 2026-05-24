export const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const getSafeTimeRating = (hour) => {
  if (hour >= 6 && hour < 20) return { label: 'Safe to Travel', color: '#27AE60', score: 9 };
  if (hour >= 20 && hour < 22) return { label: 'Use Caution', color: '#F2994A', score: 6 };
  return { label: 'High Risk Time', color: '#E74C3C', score: 3 };
};

export const getCurrentTimeRating = () => {
  return getSafeTimeRating(new Date().getHours());
};