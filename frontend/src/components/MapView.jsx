import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from '../context/LocationContext.jsx';

const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const fetchRealSafetyData = async (lat, lng, radiusMeters = 3000) => {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="police"](around:${radiusMeters},${lat},${lng});
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="fire_station"](around:${radiusMeters},${lat},${lng});
      node["amenity"="bar"](around:${radiusMeters},${lat},${lng});
      node["amenity"="pub"](around:${radiusMeters},${lat},${lng});
      node["amenity"="nightclub"](around:${radiusMeters},${lat},${lng});
      node["landuse"="industrial"](around:${radiusMeters},${lat},${lng});
      node["highway"="track"](around:${radiusMeters},${lat},${lng});
      node["amenity"="bus_station"](around:${radiusMeters},${lat},${lng});
      node["highway"="bus_stop"](around:${radiusMeters},${lat},${lng});
      node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      node["amenity"="marketplace"](around:${radiusMeters},${lat},${lng});
    );
    out center;
  `;
  const res = await fetch(`${BACKEND}/api/proxy/overpass`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
  });
  const data = await res.json();
  return data.elements || [];
};

const classifyPlace = (element) => {
  const amenity = element.tags?.amenity;
  const landuse = element.tags?.landuse;
  const highway = element.tags?.highway;
  const lat = element.lat || element.center?.lat;
  const lng = element.lon || element.center?.lon;
  const name = element.tags?.name || '';
  if (!lat || !lng) return null;

  if (amenity === 'police')       return { lat, lng, severity: 'low',    label: 'Police Station', desc: name || 'Police presence — safe area',            icon: '👮', layer: 'safe',    source: 'osm' };
  if (amenity === 'hospital')     return { lat, lng, severity: 'low',    label: 'Hospital',       desc: name || 'Hospital — safe area',                   icon: '🏥', layer: 'safe',    source: 'osm' };
  if (amenity === 'fire_station') return { lat, lng, severity: 'low',    label: 'Fire Station',   desc: name || 'Emergency services',                     icon: '🚒', layer: 'safe',    source: 'osm' };
  if (amenity === 'bar' || amenity === 'pub') return { lat, lng, severity: 'medium', label: 'Bar / Pub', desc: (name || 'Bar') + ' — caution at night',  icon: '🍺', layer: 'warning', source: 'osm' };
  if (amenity === 'nightclub')    return { lat, lng, severity: 'medium', label: 'Nightclub',      desc: (name || 'Nightclub') + ' — stay alert',          icon: '🎵', layer: 'warning', source: 'osm' };
  if (amenity === 'marketplace')  return { lat, lng, severity: 'medium', label: 'Market',         desc: (name || 'Market') + ' — crowded, watch belongings', icon: '🛒', layer: 'warning', source: 'osm' };
  if (landuse === 'industrial')   return { lat, lng, severity: 'high',   label: 'Industrial Zone',desc: (name || 'Industrial') + ' — avoid at night',     icon: '🏭', layer: 'danger',  source: 'osm' };
  if (highway === 'track')        return { lat, lng, severity: 'high',   label: 'Isolated Road',  desc: 'Unlit or isolated road — high risk at night',    icon: '🌑', layer: 'danger',  source: 'osm' };
  if (amenity === 'bus_station' || highway === 'bus_stop') return { lat, lng, severity: 'medium', label: 'Bus Stop', desc: (name || 'Bus stop') + ' — watch belongings', icon: '🚌', layer: 'transit', source: 'osm' };
  if (amenity === 'pharmacy')     return { lat, lng, severity: 'low',    label: 'Pharmacy',       desc: name || 'Pharmacy nearby',                        icon: '💊', layer: 'medical', source: 'osm' };
  if (amenity === 'clinic')       return { lat, lng, severity: 'low',    label: 'Clinic',         desc: name || 'Medical clinic',                         icon: '🩺', layer: 'medical', source: 'osm' };
  return null;
};

export default function MapView({ reports = [], onMapClick, destination = null, activeLayers = ['safe', 'warning', 'danger'] }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const fetchTimeoutRef = useRef(null);
  const lastFetchCenterRef = useRef(null);
  const { location } = useLocation();
  const [realMarkers, setRealMarkers] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch data for any lat/lng — used on load AND on map move
  const fetchForCenter = useCallback(async (lat, lng) => {
    // Don't refetch if we moved less than 1km from last fetch
    if (lastFetchCenterRef.current) {
      const dLat = Math.abs(lastFetchCenterRef.current.lat - lat);
      const dLng = Math.abs(lastFetchCenterRef.current.lng - lng);
      const distKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
      if (distKm < 1) return;
    }

    lastFetchCenterRef.current = { lat, lng };
    setDataLoading(true);

    try {
      const elements = await fetchRealSafetyData(lat, lng, 3000);
      const markers = elements.map(classifyPlace).filter(Boolean);
      setRealMarkers(markers);
    } catch (err) {
      console.warn('Overpass fetch failed:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [location.lat, location.lng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Create a dedicated layer group for markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    if (onMapClick) map.on('click', (e) => onMapClick(e.latlng));

    // Refetch data when map stops moving
    map.on('moveend', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();

      // Only fetch when zoomed in enough (zoom 12+) to avoid fetching whole country
      if (zoom < 12) {
        setRealMarkers([]);
        return;
      }

      // Debounce — wait 800ms after map stops before fetching
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = setTimeout(() => {
        fetchForCenter(center.lat, center.lng);
      }, 800);
    });

    mapInstanceRef.current = map;

    return () => {
      clearTimeout(fetchTimeoutRef.current);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Initial fetch when location is known
  useEffect(() => {
    if (!location.lat || !location.lng) return;

    const map = mapInstanceRef.current;
    if (map) {
      map.setView([location.lat, location.lng], 14);
    }

    fetchForCenter(location.lat, location.lng);
  }, [location.lat, location.lng]);

  // Redraw markers whenever data or active layers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    const markersLayer = markersLayerRef.current;
    if (!map || !L || !markersLayer) return;

    // Clear all markers
    markersLayer.clearLayers();

    // User location dot
    const userIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;background:#4285F4;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(66,133,244,0.5)"></div>`,
      iconSize: [16, 16], iconAnchor: [8, 8], className: '',
    });
    L.marker([location.lat, location.lng], { icon: userIcon })
      .addTo(markersLayer)
      .bindPopup('<b>📍 You are here</b>');

    const colors = { low: '#27AE60', medium: '#F2994A', high: '#E74C3C' };

    // Filter markers by active layers
    const allMarkers = [
      ...realMarkers.filter(m => activeLayers.includes(m.layer)),
      ...reports
        .filter(() => activeLayers.includes('reports'))
        .map(r => ({
          lat: r.location?.coordinates?.lat,
          lng: r.location?.coordinates?.lng,
          severity: r.severity,
          label: r.type?.replace(/_/g, ' '),
          desc: r.description,
          icon: '⚠️',
          layer: 'reports',
          source: 'user',
        }))
        .filter(r => r.lat && r.lng),
    ];

    allMarkers.forEach(item => {
      const color = colors[item.severity] || '#27AE60';
      const size = 26;

      const icon = L.divIcon({
        html: `<div style="
          width:${size}px;height:${size}px;
          background:${color};
          border:2.5px solid white;
          border-radius:50%;
          box-shadow:0 2px 6px rgba(0,0,0,0.2);
          cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          font-size:13px;
        ">${item.icon}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        className: '',
      });

      L.marker([item.lat, item.lng], { icon })
        .addTo(markersLayer)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:180px;padding:4px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="font-size:1.1rem">${item.icon}</span>
              <b style="color:${color};font-size:0.9rem">${item.label?.toUpperCase()}</b>
              <span style="font-size:0.68rem;background:${color}22;color:${color};padding:2px 6px;border-radius:10px;font-weight:700">
                ${item.source === 'user' ? 'USER REPORT' : 'REAL DATA'}
              </span>
            </div>
            <span style="font-size:0.83rem;color:#555;line-height:1.5;display:block">${item.desc}</span>
            <div style="margin-top:8px;padding:4px 8px;border-radius:6px;background:${color}22;display:inline-block">
              <span style="font-size:0.72rem;font-weight:700;color:${color}">
                ${item.severity === 'low' ? '🟢 SAFE' : item.severity === 'medium' ? '🟠 CAUTION' : '🔴 DANGER'}
              </span>
            </div>
          </div>
        `);
    });

    // Destination marker
    if (destination) {
      const destIcon = L.divIcon({
        html: `<div style="width:28px;height:28px;background:#27AE60;border:3px solid white;border-radius:50%;box-shadow:0 2px 12px rgba(39,174,96,0.6);display:flex;align-items:center;justify-content:center;font-size:15px">🎯</div>`,
        iconSize: [28, 28], iconAnchor: [14, 14], className: '',
      });
      L.marker([destination.lat, destination.lng], { icon: destIcon })
        .addTo(markersLayer)
        .bindPopup(`<b>🎯 ${destination.name}</b>`)
        .openPopup();
    }
  }, [reports, location, destination, realMarkers, activeLayers]);

  // Draw route
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (!destination) return;

    fetch(
      `https://router.project-osrm.org/route/v1/driving/` +
      `${location.lng},${location.lat};${destination.lng},${destination.lat}` +
      `?overview=full&geometries=geojson`
    )
      .then(r => r.json())
      .then(data => {
        if (data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          const polyline = L.polyline(coords, { color: '#27AE60', weight: 5, opacity: 0.8 }).addTo(map);
          routeLayerRef.current = polyline;
          map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        }
      })
      .catch(() => {
        const line = L.polyline(
          [[location.lat, location.lng], [destination.lat, destination.lng]],
          { color: '#27AE60', weight: 4, opacity: 0.7, dashArray: '10,10' }
        ).addTo(map);
        routeLayerRef.current = line;
        map.fitBounds(line.getBounds(), { padding: [40, 40] });
      });
  }, [destination]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mapRef}
        style={{ width: '100%', height: '100%', borderRadius: 'var(--radius)', overflow: 'hidden' }}
      />
      {dataLoading && (
        <div style={{
          position: 'absolute', bottom: 60, left: '50%',
          transform: 'translateX(-50%)',
          background: 'white', borderRadius: 20,
          padding: '8px 16px',
          fontSize: '0.78rem', color: '#2196F3', fontWeight: 600,
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 8, zIndex: 500,
          whiteSpace: 'nowrap',
        }}>
          <div style={{
            width: 10, height: 10,
            border: '2px solid #E3F2FD',
            borderTopColor: '#2196F3',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }} />
          Loading safety data for this area...
        </div>
      )}
      {!dataLoading && (
        <div style={{
          position: 'absolute', bottom: 60, left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)', borderRadius: 20,
          padding: '6px 14px',
          fontSize: '0.72rem', color: 'white', fontWeight: 500,
          zIndex: 500, whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          🗺️ Pan or zoom to load safety data for any area in India
        </div>
      )}
    </div>
  );
}