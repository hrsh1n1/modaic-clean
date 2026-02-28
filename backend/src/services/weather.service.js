/**
 * modaic/backend/src/services/weather.service.js
 * Real weather data from Open-Meteo API — completely FREE, no API key needed
 * Docs: https://open-meteo.com/
 */

const https = require('https');

const WMO_CODES = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Rain showers', 81: 'Heavy showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail',
};

/**
 * Fetch from URL (promisified https.get)
 */
const fetchJson = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(e); }
    });
  }).on('error', reject);
});

/**
 * Get current weather for coordinates
 * Returns a human-readable weather string for AI context
 */
const getWeatherForLocation = async (lat, lon) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m&wind_speed_unit=kmh&temperature_unit=celsius`;
    const data = await fetchJson(url);

    const current = data.current;
    const temp    = Math.round(current.temperature_2m);
    const code    = current.weathercode;
    const humidity= current.relativehumidity_2m;
    const wind    = Math.round(current.windspeed_10m);
    const desc    = WMO_CODES[code] || 'Variable';

    // Build outfit-relevant weather summary
    let outfitNote = '';
    if (temp >= 30) outfitNote = 'Very hot — light, breathable fabrics';
    else if (temp >= 22) outfitNote = 'Warm and pleasant';
    else if (temp >= 15) outfitNote = 'Mild — light layers recommended';
    else if (temp >= 8) outfitNote = 'Cool — jacket or cardigan needed';
    else outfitNote = 'Cold — warm layers essential';

    if ([61, 63, 65, 80, 81, 82].includes(code)) outfitNote += ', bring a raincoat or umbrella';
    if ([71, 73, 75].includes(code)) outfitNote += ', waterproof boots recommended';

    return {
      temp,
      description: desc,
      humidity,
      wind,
      outfitNote,
      summary: `${temp}°C, ${desc}. ${outfitNote}.`,
    };
  } catch (err) {
    return null;
  }
};

/**
 * Geocode city name to lat/lon using Open-Meteo geocoding (also free)
 */
const geocodeCity = async (city) => {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const data = await fetchJson(url);
    if (data.results?.length) {
      const { latitude, longitude, name, country } = data.results[0];
      return { lat: latitude, lon: longitude, name, country };
    }
    return null;
  } catch {
    return null;
  }
};

module.exports = { getWeatherForLocation, geocodeCity };