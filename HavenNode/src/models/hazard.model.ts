export interface Hazard {
    id: number;
    municipality: string; // e.g., "Baguio", "La Trinidad", "Itogon"
    hazardType: 'Flood' | 'Landslide' | 'Storm Surge';
    severity: 'Low' | 'Medium' | 'High';
    coordinates: {
      lat: number;
      lng: number;
    };
    lastUpdated: Date;
  }