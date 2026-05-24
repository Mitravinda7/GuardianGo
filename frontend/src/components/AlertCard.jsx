import { formatTimeAgo } from '../utils/timeUtils.js';
import { getSeverityBadgeStyle } from '../utils/safetyColors.js';

const typeIcons = {
  accident: '🚗', hazard: '⚠️', suspicious: '👁️', weather: '🌩️', general: '📢'
};

export default function AlertCard({ alert }) {
  const badgeStyle = getSeverityBadgeStyle(alert.severity);

  return (
    <>
      <style>{`
        .alert-card {
          background: var(--surface);
          border-radius: var(--radius);
          padding: 20px 24px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: var(--transition);
        }
        .alert-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
        .alert-card.high { border-left: 4px solid var(--danger); }
        .alert-card.medium { border-left: 4px solid var(--secondary); }
        .alert-card.low { border-left: 4px solid var(--success); }
        .alert-icon-wrap {
          width: 48px; height: 48px;
          border-radius: 12px;
          background: var(--bg);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        .alert-body { flex: 1; }
        .alert-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
        .alert-title { font-weight: 700; font-size: 1rem; font-family: var(--font-display); }
        .alert-message { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 8px; }
        .alert-meta { display: flex; gap: 12px; font-size: 0.78rem; color: var(--text-light); }
      `}</style>

      <div className={`alert-card ${alert.severity}`}>
        <div className="alert-icon-wrap">{typeIcons[alert.type] || '📢'}</div>
        <div className="alert-body">
          <div className="alert-header">
            <span className="alert-title">{alert.title}</span>
            <span className="badge" style={badgeStyle}>{alert.severity?.toUpperCase()}</span>
          </div>
          <p className="alert-message">{alert.message}</p>
          <div className="alert-meta">
            <span>📍 {alert.location?.city || 'Your area'}</span>
            <span>🕐 {formatTimeAgo(alert.createdAt)}</span>
          </div>
        </div>
      </div>
    </>
  );
}