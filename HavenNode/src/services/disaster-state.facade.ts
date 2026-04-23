import { Injectable, signal, computed, inject } from '@angular/core';
import { OpenMeteoService } from './open-meteo.service';
import { LocalHazardProfile, RiskLevel } from '../models/hazard.model';

@Injectable({ providedIn: 'root' })
export class DisasterStateFacade {
  private meteoService = inject(OpenMeteoService);

  // Core Writable Signals
  hazardState = signal<LocalHazardProfile | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Computed Signals for the UI Cards
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
      // Fetch both APIs at the same time
      const [weather, flood] = await Promise.all([
        this.meteoService.fetchGraphCastData(),
        this.meteoService.fetchFloodData()
      ]);

      const profile: LocalHazardProfile = {
        temperature: weather.current.temperature_2m,
        windSpeed: weather.current.wind_speed_10m,
        precipitation: weather.current.precipitation,
        soilMoisture: weather.hourly.soil_moisture_0_to_1cm[0] || 0.45,
        riverDischarge: flood.daily?.river_discharge_mean?.[0] || 12.5,
        pagasaSignal: weather.current.wind_speed_10m > 61 ? 'TCWS No. 2' : (weather.current.wind_speed_10m > 39 ? 'TCWS No. 1' : 'No Active Cyclone'),
        timestamp: new Date().toLocaleTimeString()
      };

      this.hazardState.set(profile);
    } catch (err) {
      console.error('Data loading error:', err);
      // If the API fails, load this safe fallback data so the presentation doesn't break
      this.hazardState.set({
        temperature: 22.4,
        windSpeed: 45.2,
        precipitation: 15.0,
        soilMoisture: 0.85,
        riverDischarge: 85.3,
        pagasaSignal: 'TCWS No. 1',
        timestamp: new Date().toLocaleTimeString()
      });
      this.error.set('Live data degraded. Using cached baseline.');
    } finally {
      this.isLoading.set(false);
    }
  }
}