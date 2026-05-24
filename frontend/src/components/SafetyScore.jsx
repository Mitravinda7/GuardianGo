import { useState, useEffect } from 'react';
import { getSafetyScore } from '../services/reportService.js';
import { getZoneColor, getZoneLabel } from '../utils/safetyColors.js';

export default function SafetyScore({ lat, lng }) {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lng) return;
    getSafetyScore(lat, lng)
      .then(data => setScore(data.score))
      .catch(() => setScore(8))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  const color = score ? getZoneColor(score) : '#27AE60';
  const label = score ? getZoneLabel(score) : 'Safe Zone';

  return (
    <>
      <style>{`
        .score-card {
          background: var(--surface);
          border-radius: var(--radius);
          padding: 16px;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
          text-align: center;
          min-width: 160px;
        }
        .score-title { font-size: 0.78rem; color: var(--text-secondary); font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
        .score-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px;
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 800;
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .score-label { font-weight: 700; font-size: 0.9rem; }
        .score-sub { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }
      `}</style>

      <div className="score-card">
        <div className="score-title">Area Safety Score</div>
        <div className="score-circle" style={{ background: color }}>
          {loading ? '?' : score}
        </div>
        <div className="score-label" style={{ color }}>{label}</div>
        <div className="score-sub">within 2km radius</div>
      </div>
    </>
  );
}