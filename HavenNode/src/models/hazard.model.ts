export interface LocalHazardProfile {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  soilMoisture: number;
  riverDischarge: number;
  pagasaSignal: string;
  timestamp: string;
}

export type RiskLevel = 'Normal' | 'Elevated' | 'High' | 'Critical';