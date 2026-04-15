import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoahService } from '../../services/noah.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  private noahService = inject(NoahService);
  
  // ✅ Observable for the async pipe
  sensors$ = this.noahService.getBenguetSensors();
  
  // Access the signal from the service
  currentCity = this.noahService.selectedLocation;

  updateLocation(newLoc: string) {
    this.noahService.selectedLocation.set(newLoc); // ✅ Updating a Signal
  }
}