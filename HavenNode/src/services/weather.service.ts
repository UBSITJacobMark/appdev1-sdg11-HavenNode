import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly rainViewerUrl = 'https://api.rainviewer.com/public/weather-maps.json';
  private readonly openMeteoMapsBase = 'https://maps.open-meteo.com/v1/forecast';
  private readonly owmKey = 'ef65a4889c1233c5dfc14da052ab1a00';

  /**
   * FIX for TS2339: Restoring getOWMTileUrl for Wind/Temp fallback.
   */
  getOWMTileUrl(layer: 'wind_new' | 'temp_new'): string {
    return `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${this.owmKey}`;
  }

  getGraphCastMapUrl(parameter: 'temperature_2m' | 'wind_speed_10m' = 'temperature_2m'): string {
    return `${this.openMeteoMapsBase}/{z}/{x}/{y}.png?models=graphcast_gfs&parameter=${parameter}`;
  }

  async getRainViewerData() {
    const res = await fetch(this.rainViewerUrl);
    return res.json();
  }
}