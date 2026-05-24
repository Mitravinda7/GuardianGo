import { useState, useEffect } from 'react';
import MapView from '../components/MapView.jsx';
import SafetyScore from '../components/SafetyScore.jsx';
import AirQualityOverlay from '../components/AirQualityOverlay.jsx';
import EcoRouteSuggester from '../components/EcoRouteSuggester.jsx';
import { getAllReports } from '../services/reportService.js';
import { useLocation } from '../context/LocationContext.jsx';
import { getCurrentTimeRating } from '../utils/timeUtils.js';
import TravelInsights from '../components/TravelInsights.jsx';

const LAYER_CONFIG = [
  { key: 'safe',    label: 'Safe Places',   icon: '👮', color: '#27AE60', desc: 'Police, hospitals, fire stations' },
  { key: 'warning', label: 'Caution Areas', icon: '⚠️', color: '#F2994A', desc: 'Bars, markets, nightclubs' },
  { key: 'danger',  label: 'Danger Zones',  icon: '🚫', color: '#E74C3C', desc: 'Industrial zones, isolated roads' },
  { key: 'transit', label: 'Transit',       icon: '🚌', color: '#2196F3', desc: 'Bus stops and stations' },
  { key: 'medical', label: 'Medical',       icon: '💊', color: '#9B59B6', desc: 'Pharmacies and clinics' },
  { key: 'reports', label: 'User Reports',  icon: '📝', color: '#F2C94C', desc: 'Community submitted reports' },
];


export default function Home() {
  const { location, locationLoading } = useLocation();
  const [reports, setReports] = useState([]);
  const [activeLayers, setActiveLayers] = useState(['safe', 'warning', 'danger']);
  const [destination, setDestination] = useState(null);
  const [ecoOpen, setEcoOpen] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [travelOpen, setTravelOpen] = useState(false);
  const [ecoDestination, setEcoDestination] = useState(null);
  const timeRating = getCurrentTimeRating();

  useEffect(() => {
    getAllReports({ status: 'active' })
      .then(data => setReports(data.reports || []))
      .catch(console.error);
  }, []);

  const toggleLayer = (key) => {
    setActiveLayers(prev =>
      prev.includes(key) ? prev.filter(l => l !== key) : [...prev, key]
    );
  };

  return (
    <>
      <style>{`
        .home {
          display: flex; flex-direction: column;
          height: calc(100vh - var(--navbar-height));
          overflow: hidden;
        }

        /* ── Toolbar ── */
        .home-toolbar {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap; gap: 8px; flex-shrink: 0;
        }
        .location-info { display: flex; align-items: center; gap: 8px; }
        .location-dot {
          width: 9px; height: 9px;
          background: var(--success); border-radius: 50%;
          animation: pdot 2s infinite;
        }
        @keyframes pdot { 0%,100%{opacity:1} 50%{opacity:.4} }
        .location-text { font-weight: 600; font-size: 0.92rem; }
        .location-sub { font-size: 0.75rem; color: var(--text-secondary); }
        .toolbar-right { display: flex; align-items: center; gap: 10px; }
        .time-badge {
          padding: 6px 13px; border-radius: 20px;
          font-size: 0.8rem; font-weight: 600; color: white;
        }

        /* ── Map Layers button ── */
        .layers-wrap { position: relative; }
        .layers-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 15px; border-radius: 20px;
          background: var(--surface); border: 2px solid var(--border);
          font-size: 0.85rem; font-weight: 600; cursor: pointer;
          transition: var(--transition); font-family: var(--font-body);
          color: var(--text-main);
        }
        .layers-btn:hover, .layers-btn.open { border-color: var(--primary); background: #FFFBF0; }
        .layers-count {
          background: var(--primary); color: var(--text-main);
          min-width: 18px; height: 18px; border-radius: 9px;
          font-size: 0.7rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
        }

        /* ── Layers dropdown ── */
        .layers-panel {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); box-shadow: var(--shadow-lg);
          width: 280px; z-index: 2000;
          animation: fadeIn 0.15s ease; overflow: hidden;
        }
        .layers-panel-header {
          padding: 12px 16px; background: var(--bg);
          border-bottom: 1px solid var(--border);
          font-size: 0.72rem; font-weight: 800;
          color: var(--text-secondary); text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .layer-row {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 16px; cursor: pointer;
          border-bottom: 1px solid var(--border);
          transition: background 0.12s;
        }
        .layer-row:last-child { border-bottom: none; }
        .layer-row:hover { background: var(--bg); }
        .layer-icon { font-size: 1.1rem; width: 22px; text-align: center; flex-shrink: 0; }
        .layer-text { flex: 1; }
        .layer-name { font-weight: 600; font-size: 0.88rem; color: var(--text-main); }
        .layer-sub { font-size: 0.72rem; color: var(--text-secondary); margin-top: 1px; }
        .toggle-pill {
          width: 40px; height: 22px; border-radius: 11px;
          border: none; cursor: pointer; position: relative;
          transition: background 0.2s; flex-shrink: 0;
        }
        .toggle-pill::after {
          content: ''; position: absolute;
          top: 3px; left: 3px;
          width: 16px; height: 16px;
          background: white; border-radius: 50%;
          transition: left 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .toggle-pill.on::after { left: 21px; }

        /* ── Body ── */
        .home-body { display: flex; flex: 1; overflow: hidden; position: relative; }
        .map-area { flex: 1; position: relative; min-width: 0; }

        /* ── Map overlays (right side) ── */
        .map-overlay {
          position: absolute; top: 14px; right: 14px;
          z-index: 500; display: flex; flex-direction: column;
          gap: 10px; max-width: 168px;
        }
        .legend-card {
          background: var(--surface); border-radius: var(--radius);
          padding: 12px; box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
        }
        .legend-title { font-weight: 700; font-size: 0.78rem; margin-bottom: 8px; color: var(--text-main); }
        .legend-row { display: flex; align-items: center; gap: 7px; margin-bottom: 5px; font-size: 0.74rem; color: var(--text-secondary); }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .stats-row { display: flex; gap: 6px; }
        .stat-chip {
          background: var(--surface); border-radius: var(--radius);
          padding: 8px 6px; box-shadow: var(--shadow);
          border: 1px solid var(--border); text-align: center; flex: 1;
        }
        .stat-num { font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; }
        .stat-lbl { font-size: 0.62rem; color: var(--text-secondary); font-weight: 500; }

        /* ── ECO ROUTE — floating left button ── */
        .eco-fab {
          position: absolute;
          left: 14px; bottom: 70px;
          z-index: 600;
          display: flex; flex-direction: column; align-items: flex-start; gap: 0;
        }
        .eco-fab-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 20px; border-radius: 30px;
          background: #1B5E20; color: white;
          border: none; cursor: pointer;
          font-family: var(--font-display); font-size: 0.95rem; font-weight: 700;
          box-shadow: 0 4px 16px rgba(27,94,32,0.45);
          transition: var(--transition);
          white-space: nowrap;
        }
        .eco-fab-btn:hover { background: #27AE60; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(27,94,32,0.5); }
        .eco-fab-btn.open { background: #27AE60; border-radius: 30px 30px 0 0; }
        .eco-fab-pulse {
          display: inline-block;
          width: 8px; height: 8px; border-radius: 50%;
          background: #A5D6A7;
          animation: eco-pulse 2s infinite;
        }
        @keyframes eco-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }

        /* ── Route bar ── */
        .route-bar {
          position: absolute; bottom: 14px; left: 14px; right: 14px;
          background: var(--surface); border-radius: var(--radius);
          padding: 12px 16px; box-shadow: var(--shadow-lg);
          border: 2px solid #27AE60;
          display: flex; align-items: center; justify-content: space-between;
          z-index: 500; animation: slideUp 0.2s ease;
        }
        @keyframes slideUp { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
        .route-dest { font-weight: 700; font-size: 0.88rem; color: var(--text-main); }
        .route-sub { color: var(--text-secondary); font-size: 0.76rem; margin-top: 2px; }
        .route-clear {
          background: #FEE; border: none; cursor: pointer;
          color: var(--danger); font-size: 0.82rem; font-weight: 600;
          padding: 6px 12px; border-radius: 8px; transition: var(--transition);
        }
        .route-clear:hover { background: var(--danger); color: white; }

        /* ── Eco side panel ── */
        .eco-panel {
          width: 340px; flex-shrink: 0; height: 100%;
          overflow-y: auto; background: var(--bg);
          border-left: 1px solid var(--border); padding: 16px;
          animation: slideIn 0.2s ease;
        }
        @keyframes slideIn { from{transform:translateX(14px);opacity:0} to{transform:translateX(0);opacity:1} }
        .eco-panel-title {
          font-family: var(--font-display); font-size: 1rem; font-weight: 800;
          margin-bottom: 14px; color: #1B5E20;
          display: flex; align-items: center; justify-content: space-between;
        }
        .eco-close {
          background: none; border: none; cursor: pointer;
          color: var(--text-secondary); padding: 3px 8px;
          border-radius: 6px; transition: var(--transition); font-size: 1rem;
        }
        .eco-close:hover { background: var(--border); color: var(--danger); }

        @media (max-width: 768px) {
          .eco-panel { width: 100%; border-left: none; border-top: 1px solid var(--border); }
          .home-body { flex-direction: column; }
          .map-area { min-height: 380px; }
          .eco-fab { bottom: 90px; }
        }
      `}</style>

      <div className="home">
        {/* ── Toolbar ── */}
        <div className="home-toolbar">
          <div className="location-info">
            <div className="location-dot" />
            <div>
              <div className="location-text">
                {locationLoading ? 'Detecting location...' : `📍 ${location.city}, ${location.state}`}
              </div>
              <div className="location-sub">Live safety map</div>
            </div>
          </div>

          <div className="toolbar-right">
            <div className="time-badge" style={{ background: timeRating.color }}>
              🕐 {timeRating.label}
            </div>

            {/* Travel Insights button */}
            <button
              className={`layers-btn ${travelOpen ? 'open' : ''}`}
              onClick={() => { setTravelOpen(o => !o); setEcoOpen(false); }}
              style={{ borderColor: travelOpen ? '#9B59B6' : '', background: travelOpen ? '#F3E5F5' : '' }}
            >
              🧭 Travel Insights
            </button>



            {/* Map Layers */}
            <div className="layers-wrap">
              <button
                className={`layers-btn ${showLayers ? 'open' : ''}`}
                onClick={() => setShowLayers(o => !o)}
              >
                🗂️ Map Layers
                <span className="layers-count">{activeLayers.length}</span>
              </button>

              {showLayers && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 1999 }}
                    onClick={() => setShowLayers(false)}
                  />
                  <div className="layers-panel">
                    <div className="layers-panel-header">Show / Hide Map Layers</div>
                    {LAYER_CONFIG.map(layer => {
                      const isOn = activeLayers.includes(layer.key);
                      return (
                        <div
                          key={layer.key}
                          className="layer-row"
                          onClick={() => toggleLayer(layer.key)}
                        >
                          <div className="layer-icon">{layer.icon}</div>
                          <div className="layer-text">
                            <div className="layer-name" style={{ color: isOn ? layer.color : 'var(--text-secondary)' }}>
                              {layer.label}
                            </div>
                            <div className="layer-sub">{layer.desc}</div>
                          </div>
                          <button
                            className={`toggle-pill ${isOn ? 'on' : ''}`}
                            style={{ background: isOn ? layer.color : '#CBD5E0' }}
                            onClick={e => { e.stopPropagation(); toggleLayer(layer.key); }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
          
        </div>

        {/* ── Body ── */}
        <div className="home-body">

          {/* Map */}
          <div className="map-area">
            <MapView
              reports={reports}
              destination={destination}
              activeLayers={activeLayers}
            />

            {/* Right side overlays */}
            <div className="map-overlay">
              <SafetyScore lat={location.lat} lng={location.lng} />
              <AirQualityOverlay />
              <div className="legend-card">
                <div className="legend-title">📌 Legend</div>
                <div className="legend-row"><div className="legend-dot" style={{ background: '#4285F4' }} />Your Location</div>
                <div className="legend-row"><div className="legend-dot" style={{ background: '#27AE60' }} />Safe Places</div>
                <div className="legend-row"><div className="legend-dot" style={{ background: '#F2994A' }} />Caution Areas</div>
                <div className="legend-row"><div className="legend-dot" style={{ background: '#E74C3C' }} />Danger Zones</div>
                <div className="legend-row"><div className="legend-dot" style={{ background: '#2196F3' }} />Transit</div>
                <div className="legend-row"><div className="legend-dot" style={{ background: '#9B59B6' }} />Medical</div>
              </div>
              <div className="stats-row">
                <div className="stat-chip">
                  <div className="stat-num" style={{ color: 'var(--danger)' }}>{reports.filter(r => r.severity === 'high').length}</div>
                  <div className="stat-lbl">High</div>
                </div>
                <div className="stat-chip">
                  <div className="stat-num" style={{ color: 'var(--warning)' }}>{reports.filter(r => r.severity === 'medium').length}</div>
                  <div className="stat-lbl">Med</div>
                </div>
                <div className="stat-chip">
                  <div className="stat-num" style={{ color: 'var(--success)' }}>{reports.filter(r => r.severity === 'low').length}</div>
                  <div className="stat-lbl">Low</div>
                </div>
              </div>
            </div>

            {/* ECO ROUTE — floating bottom-left button */}
            {!ecoOpen && !travelOpen && (
              <div className="eco-fab">
                <button
                  className="eco-fab-btn"
                  onClick={() => { setEcoOpen(true); setTravelOpen(false); }}
                >
                  <span className="eco-fab-pulse" />
                  🌱 Eco Route Planner
                </button>
              </div>
            )}

            {/* Route info bar */}
            {destination && (
              <div className="route-bar">
                <div>
                  <div className="route-dest">🎯 {destination.name}</div>
                  <div className="route-sub">Route shown on map • {destination.distKm} km away</div>
                </div>
                <button className="route-clear" onClick={() => setDestination(null)}>✕ Clear Route</button>
              </div>
            )}
          </div>

          {/* Eco panel — slides in from right */}
          {/* Eco panel */}
          {ecoOpen && (
            <div className="eco-panel">
              <div className="eco-panel-title">
                🌱 Eco Route Planner
                <button className="eco-close" onClick={() => {
                  setEcoOpen(false);
                  setEcoDestination(null);
                }}>✕ Close</button>
              </div>
              <EcoRouteSuggester
                onDestinationSelect={(dest) => setDestination(dest)}
                prefilledDestination={ecoDestination}
              />
            </div>
          )}

          {/* Travel Insights panel */}
          {travelOpen && (
            <div className="eco-panel" style={{ borderLeft: '3px solid #9B59B6' }}>
              <div className="eco-panel-title" style={{ color: '#6A1B9A' }}>
                🧭 Travel Insights
                <button className="eco-close" onClick={() => setTravelOpen(false)}>✕ Close</button>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Discover top places near <strong>{location.city}</strong>. Click any place to see it on the map with a safe route.
              </p>
              <TravelInsights
      onPlaceSelect={(dest) => {
        setDestination(dest);
        setTravelOpen(false);
      }}
      onEcoRoute={(dest) => {
        setDestination(dest);
        setEcoDestination(dest);
        setTravelOpen(false);
        setEcoOpen(true);
      }}
    />
            </div>
          )}
        </div>
      </div>
    </>
  );
}