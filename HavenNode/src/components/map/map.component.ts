import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {

  map!: L.Map;

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap() {
    this.map = L.map('map').setView([16.5, 120.8], 10); // Benguet

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

// 👇 Step 2: Multiple nodes
    const nodes = [
    { id: 1, name: 'Flood Risk - Itogon', lat: 16.45, lng: 120.63 },
    { id: 2, name: 'Safe Zone - Baguio', lat: 16.4023, lng: 120.5960 },
    { id: 3, name: 'Landslide Alert - Tuba', lat: 16.52, lng: 120.55 }
  ];

    nodes.forEach(node => {
    L.marker([node.lat, node.lng])
      .addTo(this.map)
      .bindPopup(node.name);
    });
  }
}