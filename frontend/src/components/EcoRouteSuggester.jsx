import { useState, useRef, useEffect } from 'react';
import { calculateDistance } from '../utils/distanceCalc.js';
import { useLocation } from '../context/LocationContext.jsx';

const CO2_PER_KM = { car: 0.21, bike: 0.103, walk: 0, cycle: 0, bus: 0.089 };

export default function EcoRouteSuggester({ onDestinationSelect, prefilledDestination }) {
  const { location } = useLocation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  // Auto-calculate when coming from Travel Insights
  useEffect(() => {
    if (!prefilledDestination) return;
    setQuery(prefilledDestination.name);
    setSuggestions([]);

    const distKm = parseFloat(prefilledDestination.distKm);
    const carCO2 = (distKm * CO2_PER_KM.car).toFixed(2);
    const busCO2 = (distKm * CO2_PER_KM.bus).toFixed(2);
    const bikeCO2 = (distKm * CO2_PER_KM.bike).toFixed(2);
    const savedVsCar = carCO2;
    const isWalkable = distKm <= 2;
    const isCyclable = distKm <= 10;
    const walkTime  = Math.round((distKm / 5) * 60);
    const cycleTime = Math.round((distKm / 15) * 60);
    const busTime   = Math.round((distKm / 25) * 60);
    const carTime   = Math.round((distKm / 40) * 60);

    setResult({
      distKm: distKm.toFixed(2),
      placeName: prefilledDestination.name,
      carCO2, busCO2, bikeCO2,
      savedVsCar,
      isWalkable, isCyclable,
      walkTime, cycleTime, busTime, carTime,
    });

    if (onDestinationSelect) onDestinationSelect(prefilledDestination);
  }, [prefilledDestination]);

  

  // Search any place in India using Nominatim
  const searchPlaces = (val) => {
    setQuery(val);
    setResult(null);

    if (val.length < 3) {
      setSuggestions([]);
      return;
    }

    // Debounce so we don't spam the API on every keystroke
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(val)}&` +
          `countrycodes=in&` +
          `format=json&` +
          `limit=8&` +
          `addressdetails=1&` +
          `viewbox=68.0,8.0,97.5,37.5&` +  // India bounding box
          `bounded=0`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSuggestions(data.map(place => ({
          id: place.place_id,
          name: place.display_name,
          shortName: place.name || place.display_name.split(',')[0],
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon),
          type: place.type,
          category: place.class,
        })));
      } catch (e) {
        console.error('Place search failed', e);
        setSuggestions([]);
      }
      setSearching(false);
    }, 400);
  };

  const selectPlace = (place) => {
    setQuery(place.shortName);
    setSuggestions([]);
    setLoading(true);

    const distKm = calculateDistance(
      location.lat, location.lng,
      place.lat, place.lng
    );

    const carCO2 = (distKm * CO2_PER_KM.car).toFixed(2);
    const busCO2 = (distKm * CO2_PER_KM.bus).toFixed(2);
    const bikeCO2 = (distKm * CO2_PER_KM.bike).toFixed(2);
    const savedVsCar = carCO2;
    const isWalkable = distKm <= 2;
    const isCyclable = distKm <= 10;

    // Estimate time for each mode
    const walkTime = Math.round((distKm / 5) * 60);   // 5 km/h
    const cycleTime = Math.round((distKm / 15) * 60); // 15 km/h
    const busTime = Math.round((distKm / 25) * 60);   // 25 km/h avg with stops
    const carTime = Math.round((distKm / 40) * 60);   // 40 km/h city driving

    setResult({
      distKm: distKm.toFixed(2),
      placeName: place.shortName,
      fullName: place.name,
      carCO2, busCO2, bikeCO2,
      savedVsCar,
      isWalkable, isCyclable,
      walkTime, cycleTime, busTime, carTime,
    });

    if (onDestinationSelect) {
      onDestinationSelect({
        lat: place.lat,
        lng: place.lng,
        name: place.shortName,
        distKm: distKm.toFixed(2),
      });
    }

    setLoading(false);
  };

  const getPlaceIcon = (category, type) => {
    if (category === 'amenity') {
      if (type === 'hospital' || type === 'clinic') return '🏥';
      if (type === 'school' || type === 'college' || type === 'university') return '🏫';
      if (type === 'restaurant' || type === 'cafe' || type === 'food_court') return '🍽️';
      if (type === 'police') return '👮';
      if (type === 'pharmacy') return '💊';
      if (type === 'bank' || type === 'atm') return '🏦';
      if (type === 'fuel') return '⛽';
      if (type === 'bus_station') return '🚌';
      if (type === 'place_of_worship') return '🛕';
      if (type === 'marketplace' || type === 'mall') return '🏬';
      return '📍';
    }
    if (category === 'highway') return '🛣️';
    if (category === 'railway') return '🚆';
    if (category === 'tourism') return '🗺️';
    if (category === 'shop') return '🛍️';
    if (category === 'leisure') return '🌳';
    if (category === 'place') return '🏙️';
    if (category === 'building') return '🏢';
    return '📌';
  };

  return (
    <>
      <style>{`
        .eco-suggester {
          background: linear-gradient(135deg, #F0FFF4, #E8F5E9);
          border-radius: var(--radius);
          padding: 20px;
          border: 1.5px solid #A8D5B5;
        }
        .eco-title {
          font-family: var(--font-display);
          font-weight: 700; font-size: 1rem;
          color: #1B5E20; margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .eco-input-wrap { position: relative; }
        .eco-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #A8D5B5;
          border-radius: var(--radius);
          font-family: var(--font-body);
          font-size: 0.95rem;
          background: white;
          outline: none;
          transition: var(--transition);
        }
        .eco-input:focus { border-color: #27AE60; box-shadow: 0 0 0 3px rgba(39,174,96,0.15); }
        .eco-searching {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          font-size: 0.78rem; color: #2E7D32;
          display: flex; align-items: center; gap: 4px;
        }
        .eco-spinner {
          width: 12px; height: 12px;
          border: 2px solid #A8D5B5;
          border-top-color: #27AE60;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        .eco-dropdown {
          position: absolute; top: 100%; left: 0; right: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-lg);
          z-index: 500;
          max-height: 280px;
          overflow-y: auto;
        }
        .eco-option {
          padding: 10px 14px;
          cursor: pointer;
          transition: background 0.15s;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: flex-start; gap: 10px;
        }
        .eco-option:last-child { border-bottom: none; }
        .eco-option:hover { background: #F0FFF4; }
        .eco-option-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }
        .eco-option-text {}
        .eco-option-name { font-weight: 600; font-size: 0.88rem; color: var(--text-main); }
        .eco-option-addr { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; line-height: 1.3; }
        .eco-result { margin-top: 16px; }
        .eco-dest-label {
          font-size: 0.82rem; color: #2E7D32; font-weight: 600;
          margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
        }
        .eco-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px; margin-bottom: 12px;
        }
        .eco-card {
          border-radius: var(--radius); padding: 12px;
          text-align: center; border: 2px solid transparent;
          transition: var(--transition);
        }
        .eco-card:hover { transform: translateY(-1px); }
        .eco-card.walk  { background: #E8F5E9; border-color: #27AE60; }
        .eco-card.cycle { background: #FFF9E6; border-color: #F2C94C; }
        .eco-card.bus   { background: #E3F2FD; border-color: #2196F3; }
        .eco-card.car   { background: #FEE8E8; border-color: #E74C3C; }
        .eco-card-icon  { font-size: 1.4rem; margin-bottom: 3px; }
        .eco-card-mode  { font-weight: 700; font-size: 0.82rem; margin-bottom: 2px; }
        .eco-card-time  { font-size: 0.75rem; color: var(--text-secondary); }
        .eco-card-co2   { font-size: 0.72rem; margin-top: 3px; font-weight: 600; }
        .eco-badge {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: var(--radius);
          font-size: 0.85rem; font-weight: 700;
          color: white; margin-top: 4px;
        }
        .eco-no-results {
          padding: 16px; text-align: center;
          color: var(--text-secondary); font-size: 0.88rem;
        }
      `}</style>

      <div className="eco-suggester">
        <div className="eco-title">🌱 Eco Route Suggester</div>

        <div className="eco-input-wrap">
          <input
            className="eco-input"
            placeholder="Search any place — hospital, market, street, landmark..."
            value={query}
            onChange={e => searchPlaces(e.target.value)}
            autoComplete="off"
          />
          {searching && (
            <div className="eco-searching">
              <div className="eco-spinner"></div>
              Searching...
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="eco-dropdown">
              {suggestions.map(place => (
                <div key={place.id} className="eco-option" onClick={() => selectPlace(place)}>
                  <div className="eco-option-icon">
                    {getPlaceIcon(place.category, place.type)}
                  </div>
                  <div className="eco-option-text">
                    <div className="eco-option-name">{place.shortName}</div>
                    <div className="eco-option-addr">
                      {place.name.split(',').slice(1, 3).join(',').trim()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searching && query.length >= 3 && suggestions.length === 0 && !result && (
            <div className="eco-dropdown">
              <div className="eco-no-results">No places found. Try a different search.</div>
            </div>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '16px', color: '#2E7D32', fontSize: '0.85rem' }}>
            🔍 Calculating eco route...
          </div>
        )}

        {result && (
          <div className="eco-result">
            <div className="eco-dest-label">
              📍 To: {result.placeName} &nbsp;•&nbsp; {result.distKm} km away
            </div>

            <div className="eco-cards">
              {result.isWalkable && (
                <div className="eco-card walk">
                  <div className="eco-card-icon">🚶</div>
                  <div className="eco-card-mode">Walk</div>
                  <div className="eco-card-time">~{result.walkTime} min</div>
                  <div className="eco-card-co2" style={{ color: '#27AE60' }}>0 kg CO₂ ✓</div>
                </div>
              )}
              {result.isCyclable && (
                <div className="eco-card cycle">
                  <div className="eco-card-icon">🚲</div>
                  <div className="eco-card-mode">Cycle</div>
                  <div className="eco-card-time">~{result.cycleTime} min</div>
                  <div className="eco-card-co2" style={{ color: '#27AE60' }}>0 kg CO₂ ✓</div>
                </div>
              )}
              <div className="eco-card bus">
                <div className="eco-card-icon">🚌</div>
                <div className="eco-card-mode">Bus</div>
                <div className="eco-card-time">~{result.busTime} min</div>
                <div className="eco-card-co2" style={{ color: '#2196F3' }}>{result.busCO2} kg CO₂</div>
              </div>
              <div className="eco-card car">
                <div className="eco-card-icon">🚗</div>
                <div className="eco-card-mode">Car</div>
                <div className="eco-card-time">~{result.carTime} min</div>
                <div className="eco-card-co2" style={{ color: '#E74C3C' }}>{result.carCO2} kg CO₂</div>
              </div>
            </div>

            {(result.isWalkable || result.isCyclable) ? (
              <div className="eco-badge" style={{ background: '#27AE60' }}>
                🌍 Save {result.savedVsCar} kg CO₂ by walking or cycling!
              </div>
            ) : (
              <div className="eco-badge" style={{ background: '#2196F3' }}>
                🚌 Take the bus — save {(result.carCO2 - result.busCO2).toFixed(2)} kg CO₂ vs driving
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}