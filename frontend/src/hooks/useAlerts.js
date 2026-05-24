import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getAlerts } from '../services/alertService.js';
import { useLocation } from './useLocation.js';

export const useAlerts = () => {
  const { location } = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location?.city) return;
    getAlerts(location.city)
      .then(data => setAlerts(data.alerts || []))
      .catch(console.error)
      .finally(() => setLoading(false));

    const socket = io(import.meta.env.VITE_SOCKET_URL);
    socket.emit('join_city', location.city);
    socket.on('new_alert', (alert) => setAlerts(prev => [alert, ...prev]));
    socket.on('new_report', (report) => {
      if (report.severity === 'high') {
        setAlerts(prev => [{
          _id: report._id,
          title: 'New High Severity Report',
          message: report.description,
          type: 'suspicious',
          severity: 'high',
          createdAt: report.createdAt,
        }, ...prev]);
      }
    });
    return () => { socket.emit('leave_city', location.city); socket.disconnect(); };
  }, [location?.city]);

  return { alerts, loading };
};