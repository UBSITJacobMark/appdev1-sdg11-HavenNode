import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../../components/map/map.component';
import { DisasterStateFacade } from '../../services/disaster-state.facade';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // IMPORT THE MAP COMPONENT HERE
  imports: [CommonModule, MapComponent], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Inject the Facade to manage our API states
  public facade = inject(DisasterStateFacade);

  // Grab a reference to the child MapComponent in the HTML
  @ViewChild('hazardMap') mapComponent!: MapComponent;

  ngOnInit() {
    // Tell the facade to start fetching PAGASA and Open-Meteo data
    this.facade.loadInitialData();
  }

  // Dashboard-level method that tells the map what to do
  onToggleHazardMap() {
    if (this.mapComponent) {
      this.mapComponent.toggleHazardLayer();
    }
  }
}