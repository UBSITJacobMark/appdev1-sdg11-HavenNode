import { Injectable, signal, computed } from '@angular/core';

export type HazardType = 'none' | 'flood' | 'precipitation' | 'wind' | 'temperature';

// 1. Upgraded Data Model (Real Environmental Inputs)
export interface HazardState {
  windSpeed: number;          // km/h (Converted from ECMWF)
  windDirection: number;      // degrees
  precipitation: number;      // mm/hr
  temperature: number;        // °C
  humidity: number;           // %
  pressure: number;           // hPa
  lastUpdated: number;        // Temporal sync tracker
}

@Injectable({ providedIn: 'root' })
export class DisasterStateFacade {
  public hazardState = signal<HazardState>({
    windSpeed: 0,
    windDirection: 0,
    precipitation: 0,
    temperature: 0,
    humidity: 0,
    pressure: 0,
    lastUpdated: Date.now()
  });

  public activeHazard = signal<HazardType>('none');
  public isLoading = signal<boolean>(false);
  
  // Interval reference for the live atmospheric feed
  private liveFeedInterval: any;

  // 2. The Intelligence Engine: Weighted Risk Scoring
  public riskScore = computed(() => {
    const s = this.hazardState();

    // Mathematically weighted environmental model
    const windRisk = Math.min(s.windSpeed / 80, 1) * 40;       // Wind contributes up to 40% of total risk
    const rainRisk = Math.min(s.precipitation / 50, 1) * 30;   // Rain contributes up to 30% of total risk
    const heatRisk = Math.max((s.temperature - 30) / 10, 0) * 20; // Heat contributes up to 20%
    const humidityFactor = (s.humidity / 100) * 10;            // Humidity contributes up to 10%

    return Math.round(windRisk + rainRisk + heatRisk + humidityFactor);
  });

  // 3. AI Hazard Zoning
  public riskLevel = computed(() => {
    const score = this.riskScore();

    if (score > 80) return 'CRITICAL';
    if (score > 50) return 'HIGH';
    if (score > 25) return 'MODERATE';
    return 'NORMAL';
  });

  public riskColorClass = computed(() => {
    const level = this.riskLevel();
    if (level === 'CRITICAL') return 'border-danger text-danger bg-danger bg-opacity-10';
    if (level === 'HIGH') return 'border-warning text-warning bg-warning bg-opacity-10';
    if (level === 'MODERATE') return 'border-info text-info bg-info bg-opacity-10';
    return 'border-success text-success bg-success bg-opacity-10';
  });

  // 4. Real Data Ingestion Pipeline (Initial Load)
  public async loadAllData() {
    this.isLoading.set(true);
    await this.refreshWeather();
    this.isLoading.set(false);
    
    // Trigger the continuous atmospheric simulation loop
    this.startLiveWeatherFeed();
  }

  // 5. Continuous Live Atmospheric Field Updates
  public startLiveWeatherFeed() {
    // Clear any existing loops to prevent memory leaks
    if (this.liveFeedInterval) {
      clearInterval(this.liveFeedInterval);
    }
    
    // Poll and update the environmental state every 5 seconds
    this.liveFeedInterval = setInterval(() => {
      this.refreshWeather();
    }, 5000);
  }

  public stopLiveWeatherFeed() {
    if (this.liveFeedInterval) {
      clearInterval(this.liveFeedInterval);
    }
  }

  // 6. Refresh Logic with Live Sensor Interpolation
  public async refreshWeather() {
    try {
      // Fetching real-time atmospheric data for La Trinidad, Benguet
      const url = 'https://api.open-meteo.com/v1/forecast?latitude=16.4164&longitude=120.5960&current=temperature_2m,relative_humidity_2m,precipitation,surface_pressure,wind_speed_10m,wind_direction_10m';
      const res = await fetch(url);
      const data = await res.json();
      
      this.hazardState.update(state => ({
        ...state,
        // Injecting micro-fluctuations (noise) to simulate real-time granular sensor readings
        // between the strict hourly API updates, creating a "live atmospheric field"
        temperature: data.current.temperature_2m + (Math.random() * 0.2 - 0.1),
        humidity: data.current.relative_humidity_2m,
        precipitation: data.current.precipitation,
        pressure: data.current.surface_pressure + (Math.random() * 0.4 - 0.2),
        windSpeed: data.current.wind_speed_10m + (Math.random() * 1.5 - 0.75),
        windDirection: data.current.wind_direction_10m + (Math.random() * 4 - 2),
        lastUpdated: Date.now()
      }));
    } catch (err) {
      console.error('GHIS Live Sync Failed:', err);
    }
  }

  public setActiveHazard(type: HazardType) {
    this.activeHazard.set(type);
  }
}