import { useState } from 'react';
import { triggerSOS, getMySOS, resolveSOS } from '../services/sosService.js';
import { useLocation } from '../context/LocationContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatTimeAgo } from '../utils/timeUtils.js';
import { useEffect } from 'react';

export default function SOS() {
  const { location } = useLocation();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getMySOS().then(d => setHistory(d.events || [])).catch(console.error);
  }, []);

  const handleSOS = async () => {
    setLoading(true); setError('');
    try {
      await triggerSOS(location, message || 'Emergency! I need help immediately.');
      setSuccess(true);
      const d = await getMySOS();
      setHistory(d.events || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to trigger SOS.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    await resolveSOS(id);
    setHistory(prev => prev.map(e => e._id === id ? { ...e, status: 'resolved' } : e));
  };

  return (
    <>
      <style>{`
        .sos-page { max-width: 680px; margin: 0 auto; padding: 32px; }
        .sos-hero {
          background: linear-gradient(135deg, #E74C3C, #C0392B);
          color: white;
          border-radius: var(--radius-lg);
          padding: 48px 32px;
          text-align: center;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
        }
        .sos-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .sos-hero-title { font-family: var(--font-display); font-size: 2rem; font-weight: 800; margin-bottom: 8px; position: relative; }
        .sos-hero-sub { opacity: 0.85; margin-bottom: 32px; position: relative; }
        .sos-big-btn {
          width: 120px; height: 120px;
          border-radius: 50%;
          background: white;
          color: var(--danger);
          border: none;
          cursor: pointer;
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 800;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          transition: var(--transition);
          position: relative;
        }
        .sos-big-btn:hover { transform: scale(1.05); }
        .sos-big-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .sos-ring {
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.4);
          animation: ring-pulse 2s ease-out infinite;
        }
        @keyframes ring-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .contacts-info {
          background: rgba(255,255,255,0.15);
          border-radius: var(--radius);
          padding: 12px 16px;
          margin-top: 24px;
          font-size: 0.85rem;
          position: relative;
        }
        .history-card {
          background: var(--surface);
          border-radius: var(--radius);
          padding: 16px 20px;
          border: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .history-card.active { border-left: 4px solid var(--danger); }
        .history-card.resolved { border-left: 4px solid var(--success); opacity: 0.7; }
      `}</style>

      <div className="sos-page">
        {success && <div className="alert-banner success" style={{ marginBottom: '24px' }}>✅ SOS triggered! Your emergency contacts have been notified.</div>}
        {error && <div className="alert-banner error" style={{ marginBottom: '24px' }}>⚠️ {error}</div>}

        <div className="sos-hero">
          <h1 className="sos-hero-title">🚨 SOS Emergency</h1>
          <p className="sos-hero-sub">Press the button to instantly alert your emergency contacts with your live location</p>

          <div style={{ position: 'relative', width: '120px', margin: '0 auto 24px' }}>
            <button className="sos-big-btn" onClick={handleSOS} disabled={loading}>
              <div className="sos-ring"></div>
              {loading ? '...' : 'SOS'}
            </button>
          </div>

          <div className="contacts-info">
            📞 {user?.emergencyContacts?.length || 0} emergency contact(s) will be notified via SMS & email
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>💬 Custom Message (optional)</h3>
          <textarea className="form-textarea" rows={3}
            placeholder="Add a custom message to send to your emergency contacts..."
            value={message} onChange={e => setMessage(e.target.value)} />
          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            📍 Your location: {location.city}, {location.state} ({location.lat?.toFixed(4)}, {location.lng?.toFixed(4)})
          </div>
        </div>

        {history.length > 0 && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>📋 SOS History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map(event => (
                <div key={event._id} className={`history-card ${event.status}`}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {event.status === 'active' ? '🔴 Active' : '✅ Resolved'} — {formatTimeAgo(event.createdAt)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      📍 {event.location?.city || 'Unknown location'}
                    </div>
                  </div>
                  {event.status === 'active' && (
                    <button className="btn btn-success" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      onClick={() => handleResolve(event._id)}>
                      Mark Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}