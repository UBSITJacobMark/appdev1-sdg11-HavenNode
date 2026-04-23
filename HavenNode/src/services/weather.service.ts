import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly rainViewerUrl = 'https://api.rainviewer.com/public/weather-maps.json';
  private readonly owmKey = '8b38a7985392d7705600609b533e46c7';

  async getRainViewerData() {
    const res = await fetch(this.rainViewerUrl);
    return res.json();
  }

  getOWMTileUrl(layer: 'wind_new' | 'temp_new'): string {
    return `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${this.owmKey}`;
  }
}