import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { updateProfile } from '../services/authService.js';
import CarbonTracker from '../components/CarbonTracker.jsx';


export default function Settings() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    preferences: { theme: 'light', notifications: true, language: 'en', ...user?.preferences },
  });
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [contacts, setContacts] = useState(user?.emergencyContacts || []);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true); setError(''); setSuccess(false);
    try {
      const data = await updateProfile({ ...form, emergencyContacts: contacts });
      setUser(data.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const addContact = () => {
    if (!contact.name || !contact.phone) return;
    setContacts(prev => [...prev, contact]);
    setContact({ name: '', phone: '', email: '' });
  };

  const removeContact = (i) => setContacts(prev => prev.filter((_, idx) => idx !== i));

  return (
    <>
      <style>{`
        .settings-page { max-width: 720px; margin: 0 auto; padding: 32px; }
        .settings-section { margin-bottom: 32px; }
        .settings-section-title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--border);
          display: flex; align-items: center; gap: 8px;
        }
        .contact-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
        .contact-row .form-input { flex: 1; min-width: 140px; }
        .contact-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 16px;
          background: var(--bg);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          margin-bottom: 8px;
        }
        .contact-item-info { font-size: 0.9rem; }
        .contact-item-name { font-weight: 600; }
        .contact-item-sub { color: var(--text-secondary); font-size: 0.82rem; }
        .toggle-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
        }
        .toggle-label { font-weight: 500; }
        .toggle-sub { font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px; }
        .toggle {
          width: 44px; height: 24px;
          background: var(--border);
          border-radius: 12px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: var(--transition);
        }
        .toggle.on { background: var(--success); }
        .toggle::after {
          content: '';
          position: absolute;
          top: 3px; left: 3px;
          width: 18px; height: 18px;
          background: white;
          border-radius: 50%;
          transition: var(--transition);
        }
        .toggle.on::after { left: 23px; }
        .save-btn { padding: 14px 32px; font-size: 1rem; }
      `}</style>

      <div className="settings-page">
        <div className="page-header">
          <h1 className="page-title">⚙️ Settings</h1>
          <p className="page-subtitle">Manage your profile, contacts, and preferences</p>
        </div>

        {success && <div className="alert-banner success">✅ Settings saved successfully!</div>}
        {error && <div className="alert-banner error">⚠️ {error}</div>}

        <div className="card settings-section">
          <div className="settings-section-title">👤 Profile</div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
          </div>
        </div>

        <div className="card settings-section">
          <div className="settings-section-title">🚨 Emergency Contacts</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            These contacts will be notified via SMS and email when you trigger SOS.
          </p>
          {contacts.map((c, i) => (
            <div key={i} className="contact-item">
              <div className="contact-item-info">
                <div className="contact-item-name">{c.name}</div>
                <div className="contact-item-sub">{c.phone} {c.email && `• ${c.email}`}</div>
              </div>
              <button className="btn btn-ghost" onClick={() => removeContact(i)} style={{ color: 'var(--danger)' }}>🗑️</button>
            </div>
          ))}
          <div className="contact-row">
            <input className="form-input" placeholder="Name" value={contact.name}
              onChange={e => setContact({ ...contact, name: e.target.value })} />
            <input className="form-input" placeholder="Phone (+91...)" value={contact.phone}
              onChange={e => setContact({ ...contact, phone: e.target.value })} />
            <input className="form-input" placeholder="Email (optional)" value={contact.email}
              onChange={e => setContact({ ...contact, email: e.target.value })} />
            <button className="btn btn-primary" onClick={addContact} style={{ padding: '12px 16px' }}>+ Add</button>
          </div>
        </div>

        <div className="card settings-section">
          <div className="settings-section-title">🔔 Preferences</div>
          <div className="toggle-row">
            <div>
              <div className="toggle-label">Push Notifications</div>
              <div className="toggle-sub">Receive alerts for your area</div>
            </div>
            <button
              className={`toggle ${form.preferences.notifications ? 'on' : ''}`}
              onClick={() => setForm({ ...form, preferences: { ...form.preferences, notifications: !form.preferences.notifications } })}
            />
          </div>
        </div>

        <div className="card settings-section">
  <div className="settings-section-title">🌱 Carbon Savings Tracker</div>
  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
    Track your eco-friendly travel choices and see your environmental impact.
  </p>
  <CarbonTracker />
</div>

        <button className="btn btn-primary save-btn" onClick={handleSave} disabled={loading}>
          {loading ? '⏳ Saving...' : '💾 Save Settings'}
        </button>
      </div>
    </>
  );
}