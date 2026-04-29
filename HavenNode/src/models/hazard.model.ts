export interface LocalHazardProfile {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  soilMoisture: number;
  riverDischarge: number;
  pagasaSignal: string;
  timestamp: string;
}

export interface DailyForecast {
  date: string;
  rainSum: number;
  probability: number;
}

export interface HourlyForecast {
  time: string;
  rain: number;
}

export interface ForecastState {
  daily: DailyForecast[];
  todayHourly: HourlyForecast[];
}

export type RiskLevel = 'Normal' | 'Elevated' | 'High' | 'Critical';