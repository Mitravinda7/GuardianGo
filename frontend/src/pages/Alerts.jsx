import { useAlerts } from '../hooks/useAlerts.js';
import AlertCard from '../components/AlertCard.jsx';

export default function Alerts() {
  const { alerts, loading } = useAlerts();

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🔔 Safety Alerts</h1>
        <p className="page-subtitle">Real-time alerts for your area — updated instantly</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          Loading alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>No Active Alerts</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Your area looks safe right now. Stay vigilant!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {alerts.map(alert => <AlertCard key={alert._id} alert={alert} />)}
        </div>
      )}
    </div>
  );
}