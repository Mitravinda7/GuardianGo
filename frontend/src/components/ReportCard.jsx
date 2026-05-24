import { formatTimeAgo } from '../utils/timeUtils.js';
import { getSeverityBadgeStyle } from '../utils/safetyColors.js';

const typeLabels = {
  suspicious_activity: '👁️ Suspicious Activity',
  unsafe_street: '🚧 Unsafe Street',
  poor_lighting: '💡 Poor Lighting',
  accident: '🚗 Accident',
  roadblock: '🚫 Roadblock',
  isolated_zone: '🏚️ Isolated Zone',
  other: '⚠️ Other',
};

export default function ReportCard({ report, onVote }) {
  const badgeStyle = getSeverityBadgeStyle(report.severity);

  return (
    <>
      <style>{`
        .report-card {
          background: var(--surface);
          border-radius: var(--radius);
          padding: 20px 24px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          transition: var(--transition);
        }
        .report-card:hover { box-shadow: var(--shadow-lg); }
        .report-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
        .report-type { font-weight: 700; font-family: var(--font-display); font-size: 1rem; }
        .report-badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .report-desc { color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; margin-bottom: 14px; }
        .report-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .report-meta { display: flex; gap: 12px; font-size: 0.78rem; color: var(--text-light); }
        .vote-buttons { display: flex; gap: 8px; }
        .vote-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--bg);
          cursor: pointer;
          font-size: 0.82rem;
          font-weight: 600;
          transition: var(--transition);
          font-family: var(--font-body);
        }
        .vote-btn:hover { border-color: var(--primary); background: var(--primary); }
      `}</style>

      <div className="report-card">
        <div className="report-top">
          <span className="report-type">{typeLabels[report.type] || '⚠️ Report'}</span>
          <div className="report-badges">
            <span className="badge" style={badgeStyle}>{report.severity?.toUpperCase()}</span>
            <span className="badge" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {report.status}
            </span>
          </div>
        </div>
        <p className="report-desc">{report.description}</p>
        <div className="report-footer">
          <div className="report-meta">
            <span>📍 {report.location?.city || 'Unknown'}</span>
            <span>👤 {report.user?.name || 'Anonymous'}</span>
            <span>🕐 {formatTimeAgo(report.createdAt)}</span>
          </div>
          {onVote && (
            <div className="vote-buttons">
              <button className="vote-btn" onClick={() => onVote(report._id, 'up')}>
                👍 {report.upvotes?.length || 0}
              </button>
              <button className="vote-btn" onClick={() => onVote(report._id, 'down')}>
                👎 {report.downvotes?.length || 0}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}