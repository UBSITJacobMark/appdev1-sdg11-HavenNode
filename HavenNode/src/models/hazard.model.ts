export interface Hazard {
    id: number;
    municipality: string;
    hazardType: 'Flood' | 'Landslide' | 'Storm Surge';
    severity: 'Low' | 'Medium' | 'High';
    coordinates: {
      lat: number;
      lng: number;
    };
    lastUpdated: Date;
  }