import { Component, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../../../components/map/map.component';
import { WeatherService } from '../../../services/weather.service';

@Component({
  selector: 'app-wind-hazard',
  standalone: true,
  imports: [CommonModule, MapComponent],
  template: `
    <div class="hazard-page h-100 d-flex flex-column">
      <div class="info-bar p-2 bg-dark text-white small d-flex justify-content-between border-bottom border-secondary">
        <span class="fw-bold tracking-wider">LAYER: WIND MAGNITUDE</span>
        <span class="opacity-75">SOURCE: OPENWEATHERMAP</span>
      </div>
      <div class="flex-grow-1 position-relative">
        <app-map class="w-100 h-100" #mapComp></app-map>
      </div>
    </div>
  `,
  styles: [`
    .hazard-page { height: 100%; background: #000; }
    .info-bar { z-index: 10; font-family: var(--bs-font-monospace); letter-spacing: 1px; }
    .tracking-wider { letter-spacing: 0.1em; }
  `]
})
export class WindComponent implements AfterViewInit {
  @ViewChild('mapComp') mapComp!: MapComponent;
  private weather = inject(WeatherService);

  ngAfterViewInit() {
    /**
     * FIX: We poll for the MapComponent's readiness. 
     * We use a type cast to 'any' to bypass strict private member checks 
     * if the MapComponent has not yet been updated to 'public'.
     */
    const checkReady = setInterval(() => {
      const mapInstance = this.mapComp as any;
      if (mapInstance && mapInstance.isReady) {
        this.addWindLayer();
        clearInterval(checkReady);
      }
    }, 100);
  }

  private addWindLayer() {
    const mapComp = this.mapComp as any;
    const map = mapComp.map;
    
    // Attempt to get the label ID for correct stacking, fallback to top if method missing
    const labelId = mapComp.getFirstLabelId ? mapComp.getFirstLabelId() : '';
    const url = this.weather.getOWMTileUrl('wind_new');

    if (!map) return;

    // Check if source already exists to prevent duplicate errors
    if (!map.getSource('wind-src')) {
      map.addSource('wind-src', {
        type: 'raster',
        tiles: [url],
        tileSize: 256
      });

      map.addLayer({
        id: 'wind-layer',
        type: 'raster',
        source: 'wind-src',
        paint: { 'raster-opacity': 0.7 }
      }, labelId); // Ensures labels stay ON TOP of the wind data
    }
  }
}