import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState({ lat: 17.385, lng: 78.4867, city: 'Hyderabad', state: 'Telangana' });
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          setLocation({
            lat, lng,
            city: data.address.city || data.address.town || data.address.village || 'Unknown',
            state: data.address.state || '',
            address: data.display_name,
          });
        } catch {
          setLocation(prev => ({ ...prev, lat, lng }));
        }
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(err.message);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation, locationLoading, locationError }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);