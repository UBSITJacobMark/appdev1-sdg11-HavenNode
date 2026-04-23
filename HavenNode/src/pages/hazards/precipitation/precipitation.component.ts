import { Component, AfterViewInit, ViewChild, inject, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MapComponent } from '../../../components/map/map.component';
import { WeatherService } from '../../../services/weather.service';

@Component({
  selector: 'app-precipitation',
  standalone: true,
  imports: [CommonModule, MapComponent, RouterLink],
  template: `
    <div class="hazard-mission-layout h-100 d-flex flex-column bg-black overflow-hidden">
      <!-- Mission Header -->
      <header class="mission-header p-3 d-flex justify-content-between align-items-center border-bottom border-secondary shadow-lg">
        <div class="d-flex align-items-center">
          <div class="status-pip me-3" [class.ready]="mapComp?.isReady()"></div>
          <div>
            <h1 class="h6 mb-0 fw-bold text-white tracking-widest text-uppercase">Precipitation Radar Mission</h1>
            <small class="text-info x-small tracking-wider uppercase">Live NEXRAD Data // RainViewer Integration</small>
          </div>
        </div>
        
        <div class="d-flex gap-2">
          <div class="header-stat px-3 border-end border-secondary text-end">
            <div class="x-small text-muted uppercase">Sensor Sync</div>
            <div class="fw-bold small text-info">RADAR LIVE</div>
          </div>
          <a routerLink="/dashboard" class="btn btn-outline-light btn-sm px-3 tracking-widest uppercase">
            Exit Mission
          </a>
        </div>
      </header>

      <!-- Main Viewport -->
      <main class="flex-grow-1 position-relative d-flex flex-column">
        <app-map #mapComp class="w-100 h-100"></app-map>
        
        <!-- Legend Overlay -->
        <div class="analysis-legend position-absolute bottom-0 start-0 m-4 p-4 bg-black border border-secondary shadow-lg">
          <h6 class="x-small fw-bold text-info mb-3 tracking-wider text-uppercase">Rain Intensity (dBZ)</h6>
          <div class="radar-gradient w-100 mb-2"></div>
          <div class="d-flex justify-content-between x-small text-muted font-monospace">
            <span>LIGHT</span>
            <span>MODERATE</span>
            <span>HEAVY</span>
          </div>
        </div>

        <!-- Telemetry HUD -->
        <div class="telemetry-hud position-absolute top-0 end-0 m-4 p-3 bg-black bg-opacity-75 border border-secondary text-white">
          <div class="mb-2 border-bottom border-secondary pb-1">
            <span class="x-small fw-bold tracking-widest opacity-50">RADAR TELEMETRY</span>
          </div>
          <div class="d-flex flex-column gap-1">
            <div class="d-flex justify-content-between gap-4">
              <span class="x-small text-muted">SOURCE:</span>
              <span class="x-small fw-bold">RainViewer</span>
            </div>
            <div class="d-flex justify-content-between gap-4">
              <span class="x-small text-muted">REFRESH:</span>
              <span class="x-small fw-bold">10 min</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; width: 100vw; }
    .hazard-mission-layout { height: 100%; font-family: var(--bs-font-monospace); }
    .mission-header { background: #080808; z-index: 10; position: relative; }
    .tracking-widest { letter-spacing: 0.25em; }
    .x-small { font-size: 0.65rem; }
    .status-pip {
      width: 12px; height: 12px; border-radius: 50%;
      background: #ef4444; transition: all 0.4s ease;
      border: 2px solid rgba(255, 255, 255, 0.1);
    }
    .status-pip.ready {
      background: #22c55e !important; box-shadow: 0 0 12px rgba(34, 197, 94, 0.8);
      border-color: rgba(255, 255, 255, 0.3);
    }
    .radar-gradient {
      height: 10px; border-radius: 2px;
      background: linear-gradient(90deg, #dbf2ff 0%, #007bff 50%, #6610f2 100%);
    }
    .analysis-legend { z-index: 100; min-width: 250px; backdrop-filter: blur(12px); }
    .telemetry-hud { z-index: 100; min-width: 200px; backdrop-filter: blur(12px); }
  `]
})
export class PrecipitationComponent {
  @ViewChild('mapComp') mapComp!: MapComponent;
  private weather = inject(WeatherService);
  private initialized = false;

  constructor() {
    /**
     * FIX for TS2774: 
     * We access the Signal as a function call: isReady().
     * We use effect() to reactively trigger the radar injection 
     * the moment the MapComponent signals it is ready.
     */
    effect(() => {
      const isMapReady = this.mapComp?.isReady();
      if (isMapReady && !this.initialized) {
        this.initialized = true;
        this.addRadarLayer();
      }
    });
  }

  private async addRadarLayer() {
    const map = this.mapComp.map;
    const labelId = this.mapComp.getFirstLabelId();
    
    try {
      const data = await this.weather.getRainViewerData();
      const path = data.radar.past[data.radar.past.length - 1].path;

      if (!map.getSource('radar-src')) {
        map.addSource('radar-src', {
          type: 'raster',
          tiles: [`https://tilecache.rainviewer.com${path}/256/{z}/{x}/{y}/2/1_1.png`],
          tileSize: 256
        });

        map.addLayer({
          id: 'radar-layer',
          type: 'raster',
          source: 'radar-src',
          paint: { 'raster-opacity': 0.8 }
        }, labelId);

        // Center on Baguio/Benguet
        map.flyTo({ center: [120.5960, 16.4164], zoom: 11, essential: true });
      }
    } catch (err) {
      console.error('Radar Layer Injection Failed:', err);
    }
  }
}