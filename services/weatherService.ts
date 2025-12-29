
export interface WeatherData {
  current: {
    temp: number;
    windspeed: number;
    weathercode: number;
  };
  daily: {
    time: string[];
    weathercode: number[];
    tempMax: number[];
    tempMin: number[];
    precipitation: number[];
    windMax: number[];
  };
}

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&current_weather=true&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("Weather data fetch failed");
  
  const data = await response.json();
  
  return {
    current: {
      temp: data.current_weather.temperature,
      windspeed: data.current_weather.windspeed,
      weathercode: data.current_weather.weathercode,
    },
    daily: {
      time: data.daily.time,
      weathercode: data.daily.weathercode,
      tempMax: data.daily.temperature_2m_max,
      tempMin: data.daily.temperature_2m_min,
      precipitation: data.daily.precipitation_sum,
      windMax: data.daily.windspeed_10m_max,
    }
  };
};

export const getWeatherEmoji = (code: number) => {
  if (code === 0) return '☀️'; // Clear sky
  if (code <= 3) return '🌤️'; // Partly cloudy
  if (code <= 48) return '🌫️'; // Fog
  if (code <= 57) return '🌦️'; // Drizzle
  if (code <= 67) return '🌧️'; // Rain
  if (code <= 77) return '❄️'; // Snow
  if (code <= 82) return '🌧️'; // Rain showers
  if (code <= 86) return '❄️'; // Snow showers
  if (code <= 99) return '⛈️'; // Thunderstorm
  return '❓';
};

export const getWeatherDescription = (code: number) => {
  if (code === 0) return 'Cer Senin';
  if (code <= 3) return 'Parțial Noros';
  if (code <= 48) return 'Ceață';
  if (code <= 57) return 'Burniță';
  if (code <= 67) return 'Ploaie';
  if (code <= 77) return 'Zăpadă';
  if (code <= 82) return 'Averse de ploaie';
  if (code <= 86) return 'Averse de zăpadă';
  if (code <= 99) return 'Furtună';
  return 'Necunoscut';
};
