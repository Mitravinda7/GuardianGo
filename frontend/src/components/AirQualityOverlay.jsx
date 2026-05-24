import { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext.jsx';

export default function AirQualityOverlay() {
  const { location } = useLocation();
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location.lat) return;
    setLoading(true);

    fetch(`http://localhost:5000/api/alerts/aqi?lat=${location.lat}&lng=${location.lng}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'ok') {
          setAqi({
            index: data.data?.aqi,
            pm25: data.data?.iaqi?.pm25?.v,
            pm10: data.data?.iaqi?.pm10?.v,
            city: data.data?.city?.name,
          });
        }
      })
      .catch(() => setAqi(null))
      .finally(() => setLoading(false));
  }, [location.lat, location.lng]);

  const getLevel = (val) => {
    if (!val && val !== 0) return { label: 'No Data', color: '#9B9B9B', emoji: '❓', advice: 'No nearby station' };
    if (val <= 50)  return { label: 'Good',        color: '#27AE60', emoji: '😊', advice: 'Safe to travel outdoors' };
    if (val <= 100) return { label: 'Moderate',    color: '#F2C94C', emoji: '😐', advice: 'Sensitive groups take care' };
    if (val <= 150) return { label: 'Unhealthy*',  color: '#F2994A', emoji: '😷', advice: 'Wear a mask outdoors' };
    if (val <= 200) return { label: 'Unhealthy',   color: '#E74C3C', emoji: '🚫', advice: 'Limit outdoor travel' };
    if (val <= 300) return { label: 'Very Unhealthy', color: '#9B59B6', emoji: '⚠️', advice: 'Avoid going out' };
    return           { label: 'Hazardous',         color: '#7B0D1E', emoji: '☠️', advice: 'Stay indoors' };
  };

  const level = getLevel(aqi?.index ?? aqi?.pm25);

  return (
    <>
      <style>{`
        .aqi-card {
          background: var(--surface); border-radius: var(--radius);
          padding: 16px; box-shadow: var(--shadow-lg);
          border: 1px solid var(--border); min-width: 160px;
        }
        .aqi-title { font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
        .aqi-main { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .aqi-emoji { font-size: 1.8rem; }
        .aqi-label { font-weight: 800; font-family: var(--font-display); font-size: 0.95rem; }
        .aqi-value { font-size: 0.75rem; color: var(--text-secondary); }
        .aqi-advice { font-size: 0.78rem; padding: 6px 10px; border-radius: 8px; font-weight: 500; }
        .aqi-source { font-size: 0.7rem; color: var(--text-light); margin-top: 6px; }
      `}</style>

      <div className="aqi-card">
        <div className="aqi-title">🌫️ Air Quality</div>
        {loading ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Checking...</div>
        ) : !aqi ? (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No station nearby</div>
        ) : (
          <>
            <div className="aqi-main">
              <div className="aqi-emoji">{level.emoji}</div>
              <div>
                <div className="aqi-label" style={{ color: level.color }}>{level.label}</div>
                <div className="aqi-value">
                  {aqi.index ? `AQI: ${aqi.index}` : aqi.pm25 ? `PM2.5: ${aqi.pm25}` : 'Limited data'}
                </div>
              </div>
            </div>
            <div className="aqi-advice" style={{ background: level.color + '22', color: level.color }}>
              {level.advice}
            </div>
            {aqi.city && <div className="aqi-source">📡 {aqi.city}</div>}
          </>
        )}
      </div>
    </>
  );
}