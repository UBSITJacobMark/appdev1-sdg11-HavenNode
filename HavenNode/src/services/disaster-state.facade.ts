import { Injectable, signal, computed, inject } from '@angular/core';
import { OpenMeteoService } from './open-meteo.service';
import { LocalHazardProfile, RiskLevel, ForecastState } from '../models/hazard.model';

@Injectable({ providedIn: 'root' })
export class DisasterStateFacade {
  private meteoService = inject(OpenMeteoService);

  hazardState = signal<LocalHazardProfile | null>(null);
  forecastState = signal<ForecastState | null>(null);
  isLoading = signal<boolean>(true);
  
  // Toggle state for the UI
  forecastView = signal<'daily' | 'tenday'>('daily');

  riskLevel = computed<RiskLevel>(() => {
    const state = this.hazardState();
    if (!state) return 'Normal';
    if (state.precipitation > 50 || state.riverDischarge > 100) return 'Critical';
    if (state.precipitation > 20 || state.windSpeed > 60 || state.riverDischarge > 50) return 'High';
    if (state.precipitation > 5 || state.windSpeed > 30) return 'Elevated';
    return 'Normal';
  });

  riskColorClass = computed(() => {
    switch(this.riskLevel()) {
      case 'Critical': return 'bg-danger text-white border-danger';
      case 'High': return 'bg-warning text-dark border-warning';
      case 'Elevated': return 'bg-info text-white border-info';
      default: return 'bg-success text-white border-success';
    }
  });

  async loadInitialData() {
    this.isLoading.set(true);
    try {
      const [weather, flood, forecast] = await Promise.all([
        this.meteoService.fetchGraphCastData(),
        this.meteoService.fetchFloodData(),
        this.meteoService.fetchRainForecast()
      ]);

      this.hazardState.set({
        temperature: weather.current.temperature_2m,
        windSpeed: weather.current.wind_speed_10m,
        precipitation: weather.current.precipitation,
        soilMoisture: weather.hourly.soil_moisture_0_to_1cm[0] || 0.45,
        riverDischarge: flood.daily?.river_discharge_mean?.[0] || 12.5,
        pagasaSignal: weather.current.wind_speed_10m > 61 ? 'TCWS No. 2' : (weather.current.wind_speed_10m > 39 ? 'TCWS No. 1' : 'No Active Cyclone'),
        timestamp: new Date().toLocaleTimeString()
      });

      this.forecastState.set({
        daily: forecast.daily.time.map((t: string, i: number) => ({
          date: t,
          rainSum: forecast.daily.precipitation_sum[i],
          probability: forecast.daily.precipitation_probability_max[i]
        })),
        todayHourly: forecast.hourly.time.slice(0, 24).map((t: string, i: number) => ({
          time: t,
          rain: forecast.hourly.precipitation[i]
        }))
      });
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  setForecastView(view: 'daily' | 'tenday') {
    this.forecastView.set(view);
  }
}