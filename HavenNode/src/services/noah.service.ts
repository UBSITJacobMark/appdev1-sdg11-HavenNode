import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { Hazard } from '../models/hazard.model';

@Injectable({ providedIn: 'root' })
export class NoahService {
  private http = inject(HttpClient); 
  
  selectedLocation = signal<string>('Baguio City');

  getBenguetSensors() {
    return this.http.get<Hazard[]>('YOUR_PROJECT_NOAH_API_URL').pipe(
      catchError(error => {
        console.error('Error fetching data', error);
        return of([]);
      })
    );
  }
}