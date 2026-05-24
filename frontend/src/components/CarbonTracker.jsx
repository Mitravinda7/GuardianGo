import { useState, useEffect } from 'react';

const STORAGE_KEY = 'guardiango_carbon_savings';

const TRIP_MODES = [
  { mode: 'walk', label: 'Walked', icon: '🚶', co2PerKm: 0, color: '#27AE60' },
  { mode: 'cycle', label: 'Cycled', icon: '🚲', co2PerKm: 0, color: '#F2C94C' },
  { mode: 'bus', label: 'Took Bus', icon: '🚌', co2PerKm: 0.089, color: '#2196F3' },
  { mode: 'car', label: 'Drove Car', icon: '🚗', co2PerKm: 0.21, color: '#E74C3C' },
];

export default function CarbonTracker() {
  const [trips, setTrips] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });
  const [form, setForm] = useState({ mode: 'walk', distance: '' });
  const [added, setAdded] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  }, [trips]);

  const addTrip = () => {
    if (!form.distance || isNaN(form.distance)) return;
    const modeData = TRIP_MODES.find(m => m.mode === form.mode);
    const co2 = parseFloat(form.distance) * modeData.co2PerKm;
    const carCo2 = parseFloat(form.distance) * 0.21;
    const saved = carCo2 - co2;
    const trip = { ...form, co2: co2.toFixed(3), saved: saved.toFixed(3), date: new Date().toISOString() };
    setTrips(prev => [trip, ...prev.slice(0, 49)]);
    setForm({ mode: 'walk', distance: '' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const totalSaved = trips.reduce((sum, t) => sum + parseFloat(t.saved || 0), 0);
  const totalTrips = trips.length;
  const ecoTrips = trips.filter(t => t.mode === 'walk' || t.mode === 'cycle').length;

  return (
    <>
      <style>{`
        .carbon-tracker { }
        .carbon-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .carbon-stat {
          background: linear-gradient(135deg, #E8F5E9, #F0FFF4);
          border-radius: var(--radius); padding: 16px;
          text-align: center; border: 1px solid #A8D5B5;
        }
        .carbon-stat-num { font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; color: #1B5E20; }
        .carbon-stat-label { font-size: 0.75rem; color: #2E7D32; font-weight: 600; margin-top: 4px; }
        .add-trip-form {
          background: var(--bg); border-radius: var(--radius);
          padding: 16px; margin-bottom: 20px;
          border: 1px solid var(--border);
        }
        .add-trip-title { font-weight: 700; margin-bottom: 12px; font-size: 0.95rem; }
        .mode-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
        .mode-btn {
          padding: 10px 6px; border-radius: var(--radius);
          border: 2px solid var(--border); background: var(--surface);
          cursor: pointer; text-align: center; transition: var(--transition);
          font-family: var(--font-body);
        }
        .mode-btn.selected { border-color: var(--primary); background: #FFF9E6; }
        .mode-btn-icon { font-size: 1.3rem; display: block; margin-bottom: 2px; }
        .mode-btn-label { font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); }
        .trip-input-row { display: flex; gap: 10px; }
        .trips-list { display: flex; flex-direction: column; gap: 8px; }
        .trip-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; background: var(--surface);
          border-radius: var(--radius); border: 1px solid var(--border);
          font-size: 0.88rem;
        }
        .trip-item-left { display: flex; align-items: center; gap: 10px; }
        .trip-item-icon { font-size: 1.2rem; }
        .trip-item-info {}
        .trip-item-mode { font-weight: 600; }
        .trip-item-dist { color: var(--text-secondary); font-size: 0.8rem; }
        .trip-item-saved { font-weight: 700; color: #27AE60; font-size: 0.85rem; }
        .trees-equiv { 
          background: linear-gradient(135deg, #1B5E20, #2E7D32);
          color: white; border-radius: var(--radius); padding: 16px;
          text-align: center; margin-bottom: 20px;
        }
        .trees-num { font-family: var(--font-display); font-size: 2rem; font-weight: 800; }
        .trees-label { font-size: 0.85rem; opacity: 0.9; margin-top: 4px; }
      `}</style>

      <div className="carbon-stats">
        <div className="carbon-stat">
          <div className="carbon-stat-num">{totalSaved.toFixed(2)}</div>
          <div className="carbon-stat-label">kg CO₂ Saved</div>
        </div>
        <div className="carbon-stat">
          <div className="carbon-stat-num">{totalTrips}</div>
          <div className="carbon-stat-label">Total Trips</div>
        </div>
        <div className="carbon-stat">
          <div className="carbon-stat-num">{ecoTrips}</div>
          <div className="carbon-stat-label">Eco Trips 🌱</div>
        </div>
      </div>

      {totalSaved > 0 && (
        <div className="trees-equiv">
          <div className="trees-num">🌳 {(totalSaved / 21.77).toFixed(2)}</div>
          <div className="trees-label">trees worth of CO₂ absorbed by your eco choices</div>
        </div>
      )}

      <div className="add-trip-form">
        <div className="add-trip-title">➕ Log a Trip</div>
        <div className="mode-grid">
          {TRIP_MODES.map(m => (
            <button key={m.mode}
              className={`mode-btn ${form.mode === m.mode ? 'selected' : ''}`}
              onClick={() => setForm({ ...form, mode: m.mode })}>
              <span className="mode-btn-icon">{m.icon}</span>
              <span className="mode-btn-label">{m.label}</span>
            </button>
          ))}
        </div>
        <div className="trip-input-row">
          <input className="form-input" type="number" placeholder="Distance in km"
            value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })}
            style={{ flex: 1 }} />
          <button className="btn btn-success" onClick={addTrip}>Log</button>
        </div>
        {added && <div style={{ color: '#27AE60', fontSize: '0.85rem', marginTop: '8px', fontWeight: '600' }}>✅ Trip logged!</div>}
      </div>

      {trips.length > 0 && (
        <div>
          <div style={{ fontWeight: '700', marginBottom: '12px', fontSize: '0.95rem' }}>Recent Trips</div>
          <div className="trips-list">
            {trips.slice(0, 10).map((trip, i) => {
              const modeData = TRIP_MODES.find(m => m.mode === trip.mode);
              return (
                <div key={i} className="trip-item">
                  <div className="trip-item-left">
                    <div className="trip-item-icon">{modeData?.icon}</div>
                    <div className="trip-item-info">
                      <div className="trip-item-mode">{modeData?.label}</div>
                      <div className="trip-item-dist">{trip.distance} km</div>
                    </div>
                  </div>
                  <div className="trip-item-saved">
                    {parseFloat(trip.saved) > 0 ? `+${trip.saved} kg CO₂ saved` : `${trip.co2} kg CO₂`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}