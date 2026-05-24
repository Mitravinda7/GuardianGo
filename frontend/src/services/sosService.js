import api from './api.js';

export const triggerSOS = async (location, message) => {
  const res = await api.post('/sos/trigger', { location, message });
  return res.data;
};

export const getMySOS = async () => {
  const res = await api.get('/sos/my');
  return res.data;
};

export const resolveSOS = async (id) => {
  const res = await api.put(`/sos/${id}/resolve`);
  return res.data;
};