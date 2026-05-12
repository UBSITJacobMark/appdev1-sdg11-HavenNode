import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WeatherService {

  // SAFE: only real tile provider (OpenWeatherMap)
  getOWMTileUrl(layer: 'wind_new' | 'temp_new' | 'precipitation_new' | 'pressure_new'): string {
    const owmKey = 'ef65a4889c1233c5dfc14da052ab1a00';

    return `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${owmKey}`;
  }

  async getRadarData() {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (!res.ok) throw new Error('Radar API fail');
    return res.json();
  }
}