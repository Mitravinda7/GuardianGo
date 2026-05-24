import { useState, useEffect } from 'react';
import { getAllReports, voteReport } from '../services/reportService.js';
import ReportCard from '../components/ReportCard.jsx';
import { useLocation } from '../context/LocationContext.jsx';

export default function Community() {
  const { location } = useLocation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getAllReports({ status: 'active' })
      .then(data => setReports(data.reports || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleVote = async (id, vote) => {
    try {
      const data = await voteReport(id, vote);
      setReports(prev => prev.map(r => r._id === id ? data.report : r));
    } catch (err) { console.error(err); }
  };

  const filtered = filter === 'all' ? reports : reports.filter(r => r.severity === filter);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">👥 Community Safety</h1>
        <p className="page-subtitle">Real reports from real people in your area</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'high', 'medium', 'low'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="btn"
            style={{
              padding: '8px 18px',
              background: filter === f ? 'var(--primary)' : 'var(--surface)',
              border: '2px solid var(--border)',
              borderColor: filter === f ? 'var(--primary)' : 'var(--border)',
              fontSize: '0.85rem',
            }}
          >
            {f === 'all' ? '🗂️ All' : f === 'high' ? '🔴 High' : f === 'medium' ? '🟠 Medium' : '🟢 Low'}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.9rem', alignSelf: 'center' }}>
          {filtered.length} reports
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🕊️</div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>No Reports Yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Be the first to report a safety concern in your area.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(report => (
            <ReportCard key={report._id} report={report} onVote={handleVote} />
          ))}
        </div>
      )}
    </div>
  );
}