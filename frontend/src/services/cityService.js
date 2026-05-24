let cachedCities = null;

export const getAllIndianCities = async () => {
  if (cachedCities) return cachedCities;
  try {
    const res = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'India' }),
    });
    const data = await res.json();
    cachedCities = data.data.sort();
    return cachedCities;
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    return ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];
  }
};

export const searchCities = async (query) => {
  const cities = await getAllIndianCities();
  return cities.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 10);
};