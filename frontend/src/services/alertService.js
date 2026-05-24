import api from './api.js';

export const getAlerts = async (city = '') => {
  const res = await api.get(`/alerts${city ? `?city=${city}` : ''}`);
  return res.data;
};

export const createAlert = async (data) => {
  const res = await api.post('/alerts', data);
  return res.data;
};