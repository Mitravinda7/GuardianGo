import { useState, useEffect, useRef } from 'react';
import { createReport } from '../services/reportService.js';
import { useLocation } from '../context/LocationContext.jsx';
import { searchCities } from '../services/cityService.js';
import { useNavigate } from 'react-router-dom';

export default function ReportIssue() {
  const { location } = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: '', description: '', severity: 'medium',
    location: { city: '', address: '', coordinates: { lat: 0, lng: 0 } }
  });
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityInput, setCityInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const cityRef = useRef(null);

  useEffect(() => {
    setCityInput(location.city || '');
    setForm(prev => ({
      ...prev,
      location: { ...prev.location, city: location.city, coordinates: { lat: location.lat, lng: location.lng } }
    }));
  }, [location]);

  const handleCityInput = async (val) => {
    setCityInput(val);
    setForm(prev => ({ ...prev, location: { ...prev.location, city: val } }));
    if (val.length >= 2) {
      const results = await searchCities(val);
      setCitySuggestions(results);
    } else {
      setCitySuggestions([]);
    }
  };

  const selectCity = (city) => {
    setCityInput(city);
    setForm(prev => ({ ...prev, location: { ...prev.location, city } }));
    setCitySuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type) { setError('Please select a report type.'); return; }
    setLoading(true); setError('');
    try {
      await createReport(form);
      setSuccess(true);
      setTimeout(() => navigate('/community'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { value: 'suspicious_activity', label: '👁️ Suspicious Activity' },
    { value: 'unsafe_street', label: '🚧 Unsafe Street' },
    { value: 'poor_lighting', label: '💡 Poor Lighting' },
    { value: 'accident', label: '🚗 Accident' },
    { value: 'roadblock', label: '🚫 Roadblock' },
    { value: 'isolated_zone', label: '🏚️ Isolated Zone' },
    { value: 'other', label: '⚠️ Other' },
  ];

  return (
    <>
      <style>{`
        .report-page { max-width: 680px; margin: 0 auto; padding: 32px; }
        .type-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 8px; }
        .type-btn {
          padding: 14px 16px;
          border-radius: var(--radius);
          border: 2px solid var(--border);
          background: var(--surface);
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 500;
          transition: var(--transition);
          text-align: left;
          color: var(--text-secondary);
        }
        .type-btn:hover { border-color: var(--primary); color: var(--text-main); }
        .type-btn.selected { border-color: var(--primary); background: #FFF9E6; color: var(--text-main); font-weight: 700; }
        .severity-row { display: flex; gap: 10px; }
        .severity-btn {
          flex: 1; padding: 12px;
          border-radius: var(--radius);
          border: 2px solid var(--border);
          background: var(--surface);
          cursor: pointer;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.9rem;
          transition: var(--transition);
          color: var(--text-secondary);
        }
        .severity-btn.low.selected { border-color: var(--success); background: #D4EDDA; color: var(--success); }
        .severity-btn.medium.selected { border-color: var(--secondary); background: #FFF3CD; color: var(--secondary); }
        .severity-btn.high.selected { border-color: var(--danger); background: #FEE; color: var(--danger); }
        .city-wrapper { position: relative; }
        .city-dropdown {
          position: absolute;
          top: 100%; left: 0; right: 0;
          background: var(--surface);
          border: 2px solid var(--primary);
          border-radius: var(--radius);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          max-height: 200px;
          overflow-y: auto;
        }
        .city-option {
          padding: 10px 16px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: var(--transition);
        }
        .city-option:hover { background: var(--bg); }
        .submit-btn { width: 100%; padding: 16px; justify-content: center; font-size: 1rem; margin-top: 8px; }
      `}</style>

      <div className="report-page">
        <div className="page-header">
          <h1 className="page-title">📝 Report an Issue</h1>
          <p className="page-subtitle">Help keep your community safe by reporting safety concerns</p>
        </div>

        {success && <div className="alert-banner success">✅ Report submitted! Redirecting to community feed...</div>}
        {error && <div className="alert-banner error">⚠️ {error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">What are you reporting?</label>
              <div className="type-grid">
                {reportTypes.map(t => (
                  <button type="button" key={t.value}
                    className={`type-btn ${form.type === t.value ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, type: t.value })}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Severity Level</label>
              <div className="severity-row">
                {['low', 'medium', 'high'].map(s => (
                  <button type="button" key={s}
                    className={`severity-btn ${s} ${form.severity === s ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, severity: s })}>
                    {s === 'low' ? '🟢 Low' : s === 'medium' ? '🟠 Medium' : '🔴 High'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <div className="city-wrapper" ref={cityRef}>
                <input className="form-input" placeholder="Search city..."
                  value={cityInput} onChange={e => handleCityInput(e.target.value)} />
                {citySuggestions.length > 0 && (
                  <div className="city-dropdown">
                    {citySuggestions.map(city => (
                      <div key={city} className="city-option" onClick={() => selectCity(city)}>{city}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address / Landmark (optional)</label>
              <input className="form-input" placeholder="e.g. Near City Center Mall, MG Road"
                value={form.location.address}
                onChange={e => setForm({ ...form, location: { ...form.location, address: e.target.value } })} />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" rows={4}
                placeholder="Describe the safety concern in detail..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required />
            </div>

            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
              {loading ? '⏳ Submitting...' : '📤 Submit Report'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}