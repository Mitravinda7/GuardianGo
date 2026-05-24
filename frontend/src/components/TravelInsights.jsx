import { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext.jsx';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const CATEGORY_CONFIG = [
  { key: 'tourism',   label: 'Tourist Spots', icon: '🏛️', query: 'tourism~"attraction|museum|monument|viewpoint|artwork"', color: '#9B59B6' },
  { key: 'historic',  label: 'Heritage',      icon: '🏰', query: 'historic~"castle|fort|ruins|monument|temple"',          color: '#E67E22' },
  { key: 'nature',    label: 'Nature',        icon: '🌿', query: 'leisure~"park|garden|nature_reserve"',                  color: '#27AE60' },
  { key: 'food',      label: 'Food & Cafes',  icon: '🍽️', query: 'amenity~"restaurant|cafe|food_court"',                  color: '#E74C3C' },
  { key: 'religious', label: 'Temples',       icon: '🛕', query: 'amenity="place_of_worship"',                            color: '#F2C94C' },
  { key: 'shopping',  label: 'Shopping',      icon: '🛍️', query: 'shop~"mall|supermarket|department_store"',              color: '#2196F3' },
];

const fetchPlacesByCategory = async (lat, lng, queryFilter, radius = 5000) => {
  const overpassQuery = `
    [out:json][timeout:20];
    (
      node[${queryFilter}](around:${radius},${lat},${lng});
      way[${queryFilter}](around:${radius},${lat},${lng});
    );
    out center 15;
  `;
  try {
    const res = await fetch(`${BACKEND}/api/proxy/travel`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: overpassQuery,
    });
    const data = await res.json();
    return (data.elements || [])
      .map(e => ({
        id: e.id,
        name: e.tags?.name || e.tags?.['name:en'] || null,
        lat: e.lat || e.center?.lat,
        lng: e.lon || e.center?.lon,
        type: e.tags?.tourism || e.tags?.historic || e.tags?.leisure || e.tags?.amenity || e.tags?.shop || '',
        description: e.tags?.description || e.tags?.['description:en'] || '',
        website: e.tags?.website || e.tags?.url || '',
        opening_hours: e.tags?.opening_hours || '',
        wikidata: e.tags?.wikidata || '',
      }))
      .filter(p => p.name && p.lat && p.lng);
  } catch (e) {
    console.error('Travel fetch failed', e);
    return [];
  }
};

const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
};

export default function TravelInsights({ onPlaceSelect, onEcoRoute }) {
  const { location } = useLocation();
  const [activeCategory, setActiveCategory] = useState('tourism');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    if (!location.lat) return;
    loadCategory(activeCategory);
  }, [activeCategory, location.lat]);

  const loadCategory = async (key) => {
    setLoading(true);
    setPlaces([]);
    const cat = CATEGORY_CONFIG.find(c => c.key === key);
    if (!cat) return;
    const results = await fetchPlacesByCategory(location.lat, location.lng, cat.query);
    setPlaces(results);
    setLoading(false);
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    if (onPlaceSelect) {
      onPlaceSelect({
        lat: place.lat,
        lng: place.lng,
        name: place.name,
        distKm: getDistanceKm(location.lat, location.lng, place.lat, place.lng),
      });
    }
  };

  const activeCat = CATEGORY_CONFIG.find(c => c.key === activeCategory);

  return (
    <>
      <style>{`
        .ti-wrap { display: flex; flex-direction: column; height: 100%; }
        .ti-cats { display: flex; gap: 6px; flex-wrap: wrap; padding: 0 0 14px 0; flex-shrink: 0; }
        .ti-cat-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 12px; border-radius: 20px;
          border: 2px solid var(--border);
          background: var(--surface); cursor: pointer;
          font-size: 0.8rem; font-weight: 600;
          font-family: var(--font-body); color: var(--text-main);
          transition: var(--transition); white-space: nowrap;
        }
        .ti-cat-btn:hover { border-color: var(--primary); }
        .ti-cat-btn.active { color: white; border-color: transparent; }
        .ti-meta { font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 10px; flex-shrink: 0; display: flex; align-items: center; gap: 6px; }
        .ti-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 2px; }
        .ti-card {
          background: #FFFFFF; border-radius: var(--radius);
          border: 1.5px solid #E0E0E0; overflow: visible;
          transition: var(--transition); cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .ti-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); transform: translateY(-1px); }
        .ti-card.selected { border-color: #27AE60; box-shadow: 0 0 0 2px rgba(39,174,96,0.2); }
        .ti-card-body { padding: 14px 14px 12px 14px; background: #FFFFFF; min-height: 70px; overflow: visible; }
        .ti-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; width: 100%; }
        .ti-card-name { font-weight: 700; font-size: 0.9rem; color: #1A1A1A; line-height: 1.4; flex: 1; min-width: 0; word-break: break-word; white-space: normal; overflow: visible; }
        .ti-card-dist { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 12px; white-space: nowrap; flex-shrink: 0; color: white; align-self: flex-start; margin-top: 2px; }
        .ti-card-type { font-size: 0.74rem; color: #666666; text-transform: capitalize; margin-bottom: 5px; font-weight: 500; white-space: normal; word-break: break-word; }
        .ti-card-hours { font-size: 0.72rem; color: #888888; display: flex; align-items: flex-start; gap: 4px; flex-wrap: wrap; word-break: break-word; }
        .ti-card-actions { display: flex; gap: 6px; padding: 8px 14px; background: #F8F9FA; border-top: 1px solid #EEEEEE; border-radius: 0 0 var(--radius) var(--radius); }
        .ti-action-btn { flex: 1; padding: 7px 4px; border-radius: 8px; border: 1.5px solid #DDDDDD; background: #FFFFFF; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: var(--transition); font-family: var(--font-body); color: #444444; text-align: center; }
        .ti-action-btn:hover { border-color: var(--primary); color: #111111; background: #FFFBF0; }
        .ti-action-btn.primary { background: #27AE60; color: #FFFFFF; border-color: #27AE60; }
        .ti-action-btn.primary:hover { background: #219A52; }
        .ti-action-btn.eco { color: #27AE60; border-color: #27AE60; background: #F0FFF4; }
        .ti-action-btn.eco:hover { background: #27AE60; color: white; }
        .ti-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; gap: 12px; color: #666666; font-size: 0.88rem; }
        .ti-spinner { width: 28px; height: 28px; border: 3px solid #EEEEEE; border-top-color: var(--primary); border-radius: 50%; animation: spin 0.7s linear infinite; }
        .ti-empty { text-align: center; padding: 40px 20px; color: #888888; font-size: 0.88rem; }
        .ti-empty-icon { font-size: 2.5rem; margin-bottom: 10px; }
      `}</style>

      <div className="ti-wrap">
        <div className="ti-cats">
          {CATEGORY_CONFIG.map(cat => (
            <button key={cat.key}
              className={`ti-cat-btn ${activeCategory === cat.key ? 'active' : ''}`}
              style={activeCategory === cat.key ? { background: cat.color } : {}}
              onClick={() => setActiveCategory(cat.key)}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {!loading && places.length > 0 && (
          <div className="ti-meta">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeCat?.color, display: 'inline-block' }} />
            {places.length} {activeCat?.label} found near {location.city}
          </div>
        )}

        <div className="ti-list">
          {loading ? (
            <div className="ti-loading">
              <div className="ti-spinner" />
              Finding {activeCat?.label} near {location.city}...
            </div>
          ) : places.length === 0 ? (
            <div className="ti-empty">
              <div className="ti-empty-icon">{activeCat?.icon}</div>
              <div>No {activeCat?.label} found nearby.</div>
              <div style={{ fontSize: '0.78rem', marginTop: 6 }}>Try expanding your search or pick another category.</div>
            </div>
          ) : (
            places.map(place => {
              const dist = getDistanceKm(location.lat, location.lng, place.lat, place.lng);
              const isSelected = selectedPlace?.id === place.id;
              const distNum = parseFloat(dist);
              const distColor = distNum <= 2 ? '#27AE60' : distNum <= 5 ? '#F2994A' : '#6B6B6B';

              return (
                <div key={place.id}
                  className={`ti-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handlePlaceClick(place)}>
                  <div className="ti-card-body">
                    <div className="ti-card-top">
                      <div className="ti-card-name">{place.name}</div>
                      <div className="ti-card-dist" style={{ background: distColor }}>{dist} km</div>
                    </div>
                    <div className="ti-card-type">{activeCat?.icon} {place.type?.replace(/_/g, ' ')}</div>
                    {place.opening_hours && (
                      <div className="ti-card-hours">
                        🕐 {place.opening_hours.length > 30 ? place.opening_hours.slice(0, 30) + '...' : place.opening_hours}
                      </div>
                    )}
                  </div>
                  <div className="ti-card-actions">
                    <button className="ti-action-btn primary"
                      onClick={e => { e.stopPropagation(); handlePlaceClick(place); }}>
                      🗺️ Show on Map
                    </button>
                    <button className="ti-action-btn"
                      onClick={e => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`, '_blank');
                      }}>
                      📍 Google Maps
                    </button>
                    <button className="ti-action-btn eco"
                      onClick={e => {
                        e.stopPropagation();
                        const dest = {
                          lat: place.lat, lng: place.lng,
                          name: place.name,
                          distKm: getDistanceKm(location.lat, location.lng, place.lat, place.lng),
                        };
                        if (onEcoRoute) onEcoRoute(dest);
                      }}>
                      🌱 Eco Route
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}