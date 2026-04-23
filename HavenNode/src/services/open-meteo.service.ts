import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OpenMeteoService {
  private lat = 16.4550;
  private lon = 120.5828;

  async fetchGraphCastData(): Promise<any> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lon}&current=temperature_2m,wind_speed_10m,precipitation&hourly=soil_moisture_0_to_1cm`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API failed');
    return response.json();
  }

  async fetchFloodData(): Promise<any> {
    const url = `https://flood-api.open-meteo.com/v1/flood?latitude=${this.lat}&longitude=${this.lon}&daily=river_discharge&ensemble=true&cell_selection=land`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Flood API failed');
    return response.json();
  }

  async fetchRainForecast(): Promise<any> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lon}&daily=precipitation_sum,precipitation_probability_max&hourly=precipitation&timezone=auto&forecast_days=10`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Forecast fetch failed');
    return response.json();
  }
}