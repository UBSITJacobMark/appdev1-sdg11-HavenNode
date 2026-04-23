import { Component, AfterViewInit, ElementRef, ViewChild, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as maplibregl from 'maplibre-gl'; 

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLElement>;
  
  // Default centered on La Trinidad
  @Input() center: [number, number] = [120.5828, 16.4550]; 
  @Input() zoom: number = 13;

  private map!: maplibregl.Map;

  ngAfterViewInit() {
    this.initializeMap();
  }

  private initializeMap() {
    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://tiles.openfreemap.org/styles/liberty', // OpenFreeMap Vector Tiles
      center: this.center,
      zoom: this.zoom,
      pitch: 45, // 3D perspective to visualize the valley terrain
      bearing: -17.6
    });

    this.map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    this.map.on('load', () => {
      this.addMarkersAndLayers();
    });
  }

  private addMarkersAndLayers() {
    // La Trinidad Command Center Marker
    new maplibregl.Marker({ color: '#2780E3' }) // Cosmo Primary Color
      .setLngLat(this.center)
      .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML('<strong>La Trinidad MDRRMO</strong><br>Command Center'))
      .addTo(this.map);

    // Simulated Project NOAH 25-yr Flood Susceptibility Polygon (Balili River Basin)
    this.map.addSource('balili-flood-zone', {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Polygon',
              'coordinates': [
                [
                  [120.575, 16.445],
                  [120.590, 16.445],
                  [120.595, 16.460],
                  [120.585, 16.470],
                  [120.570, 16.460],
                  [120.575, 16.445]
                ]
              ]
            },
            'properties': {}
          }
        ]
      }
    });

    // Hazard Visualization Layer
    this.map.addLayer({
      'id': 'flood-inundation-layer',
      'type': 'fill',
      'source': 'balili-flood-zone',
      'layout': {},
      'paint': {
        'fill-color': '#FF0039', // Cosmo Danger Color
        'fill-opacity': 0.4
      }
    });
    
    this.map.addLayer({
      'id': 'flood-inundation-outline',
      'type': 'line',
      'source': 'balili-flood-zone',
      'layout': {},
      'paint': {
        'line-color': '#990022',
        'line-width': 2
      }
    });
  }

  // Public method so a parent component (like the dashboard) can toggle layers
  public toggleHazardLayer() {
    if (!this.map) return;
    const visibility = this.map.getLayoutProperty('flood-inundation-layer', 'visibility');
    if (visibility === 'visible' || visibility === undefined) {
      this.map.setLayoutProperty('flood-inundation-layer', 'visibility', 'none');
      this.map.setLayoutProperty('flood-inundation-outline', 'visibility', 'none');
    } else {
      this.map.setLayoutProperty('flood-inundation-layer', 'visibility', 'visible');
      this.map.setLayoutProperty('flood-inundation-outline', 'visibility', 'visible');
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove(); // Cleanup to prevent memory leaks if the map is unmounted
    }
  }
}