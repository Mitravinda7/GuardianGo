import api from './api.js';

export const createReport = async (data) => {
  const res = await api.post('/reports', data);
  return res.data;
};

export const getAllReports = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res = await api.get(`/reports?${params}`);
  return res.data;
};

export const getReportById = async (id) => {
  const res = await api.get(`/reports/${id}`);
  return res.data;
};

export const voteReport = async (id, vote) => {
  const res = await api.put(`/reports/${id}/vote`, { vote });
  return res.data;
};

export const deleteReport = async (id) => {
  const res = await api.delete(`/reports/${id}`);
  return res.data;
};

export const getSafetyScore = async (lat, lng, radius = 2) => {
  const res = await api.get(`/reports/safety-score?lat=${lat}&lng=${lng}&radius=${radius}`);
  return res.data;
};