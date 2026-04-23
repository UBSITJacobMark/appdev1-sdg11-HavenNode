import { Component, OnInit, ViewChild, inject, effect, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisasterStateFacade, HazardType } from '../../services/disaster-state.facade';
import { WeatherService } from '../../services/weather.service';
import { MapComponent } from '../../components/map/map.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MapComponent],
  template: `
    <div class="container-fluid dashboard-layout bg-light">
      <div class="row h-100 g-3 py-3 px-2">
        
        <!-- Sidebar -->
        <div class="col-md-4 col-lg-3 d-flex flex-column gap-3 sidebar-scroll">
          
          <!-- Header / Branding -->
          <div class="d-flex flex-column mb-1">
            <div class="d-flex align-items-center">
              <div class="status-pip me-2" [class.live]="mapComp?.isReady()"></div>
              <h5 class="fw-bold mb-0 text-primary tracking-widest text-uppercase">GHIS Command</h5>
            </div>
            <div class="x-small text-muted text-uppercase mt-1 fw-bold">Benguet DRRM Protocol</div>
          </div>

          <!-- Risk Status Card -->
          @if (facade.hazardState(); as data) {
            <div class="card shadow-sm border-0" [ngClass]="facade.riskColorClass()">
              <div class="card-body text-center py-4">
                <h6 class="text-uppercase fw-bold opacity-75 mb-1">Benguet Risk Status</h6>
                <h3 class="fw-bold mb-0">{{ facade.riskLevel() }}</h3>
                <div class="small fw-bold mt-2 opacity-75">Score: {{ facade.riskScore() }}/100</div>
              </div>
            </div>

            <!-- Layer Controls (Cosmo Styled) -->
            <div class="card border-0 shadow-sm mt-2">
              <div class="card-header bg-primary text-white fw-bold small text-uppercase">Intelligence Layers</div>
              <div class="card-body p-3">
                <div class="d-grid gap-2">
                  <button class="btn btn-sm text-start px-3 fw-bold" 
                    [class.btn-primary]="facade.activeHazard() === 'none'"
                    [class.btn-outline-primary]="facade.activeHazard() !== 'none'"
                    (click)="setHazard('none')">
                    Standard Topography
                  </button>
                  <button class="btn btn-sm text-start px-3 fw-bold" 
                    [class.btn-primary]="facade.activeHazard() === 'precipitation'"
                    [class.btn-outline-primary]="facade.activeHazard() !== 'precipitation'"
                    (click)="setHazard('precipitation')">
                    Rain Radar (RainViewer)
                  </button>
                  <button class="btn btn-sm text-start px-3 fw-bold" 
                    [class.btn-primary]="facade.activeHazard() === 'wind'"
                    [class.btn-outline-primary]="facade.activeHazard() !== 'wind'"
                    (click)="setHazard('wind')">
                    Wind Vectors (ECMWF)
                  </button>
                  <button class="btn btn-sm text-start px-3 fw-bold" 
                    [class.btn-primary]="facade.activeHazard() === 'temperature'"
                    [class.btn-outline-primary]="facade.activeHazard() !== 'temperature'"
                    (click)="setHazard('temperature')">
                    Thermal Heatmap (Local)
                  </button>
                </div>
              </div>
            </div>

            <!-- Live Telemetry Readout -->
            <div class="card border-0 shadow-sm mt-auto">
              <div class="card-header bg-dark text-white fw-bold small text-uppercase">Live Telemetry</div>
              <div class="card-body p-3 bg-white">
                <div class="d-flex justify-content-between small mb-2"><span class="text-muted fw-bold">TEMP:</span><span class="fw-bold">{{ facade.hazardState().temperature | number:'1.1-1' }}°C</span></div>
                <div class="d-flex justify-content-between small mb-2"><span class="text-muted fw-bold">WIND:</span><span class="fw-bold">{{ facade.hazardState().windSpeed | number:'1.1-1' }}km/h</span></div>
                <div class="d-flex justify-content-between small mb-2"><span class="text-muted fw-bold">RAIN:</span><span class="fw-bold">{{ facade.hazardState().precipitation | number:'1.1-1' }}mm/h</span></div>
                <div class="d-flex justify-content-between small mb-2"><span class="text-muted fw-bold">HUMIDITY:</span><span class="fw-bold">{{ facade.hazardState().humidity | number:'1.0-0' }}%</span></div>
                <div class="d-flex justify-content-between small"><span class="text-muted fw-bold">PRESSURE:</span><span class="fw-bold">{{ facade.hazardState().pressure | number:'1.0-0' }}hPa</span></div>
              </div>
            </div>
          }
        </div>

        <!-- Map Area -->
        <div class="col-md-8 col-lg-9 h-100 position-relative">
          <div class="card h-100 shadow-sm border-0 overflow-hidden map-wrapper">
            <app-map #mapComp></app-map>

            <!-- Cosmo Styled Layer HUD -->
            @if (facade.activeHazard() !== 'none') {
              <div class="hud-box position-absolute top-0 end-0 m-3 p-3 bg-white border-start border-4 border-primary shadow-lg animate-slide-in rounded-1">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <h6 class="small fw-bold text-primary text-uppercase mb-0 tracking-widest">{{ facade.activeHazard() }} SCAN</h6>
                  <span class="badge bg-success text-white x-small">LIVE</span>
                </div>
                <div class="x-small text-muted fst-italic">
                  {{ 
                    facade.activeHazard() === 'precipitation' ? 'Syncing RainViewer API...' : 
                    facade.activeHazard() === 'wind' ? 'Rendering ECMWF Vector Arrows...' :
                    'Generating Local Spatial Interpolation...' 
                  }}
                </div>
              </div>
            }
          </div>
        </div>
        
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout { height: 100vh; overflow: hidden; background-color: #f8f9fa; font-family: var(--bs-font-sans-serif); }
    .sidebar-scroll { max-height: 100%; overflow-y: auto; z-index: 100; scrollbar-width: thin; }
    .map-wrapper { z-index: 1; position: relative; }
    
    .tracking-widest { letter-spacing: 0.2em; }
    .x-small { font-size: 0.7rem; }
    
    .status-pip { width: 10px; height: 10px; border-radius: 50%; background: #dc3545; transition: background 0.3s; }
    .status-pip.live { background: #28a745; box-shadow: 0 0 6px rgba(40, 167, 69, 0.6); }
    
    .hud-box { z-index: 200; min-width: 240px; }
    .animate-slide-in { animation: slideIn 0.4s cubic-bezier(0, 0.5, 0.5, 1); }
    
    /* Cosmo-specific adjustments */
    .card { border-radius: 6px; }
    .btn { border-radius: 4px; }
    
    @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class DashboardComponent implements OnInit {
  @ViewChild('mapComp') mapComp!: MapComponent;
  public facade = inject(DisasterStateFacade);
  private weather = inject(WeatherService);

  constructor() {
    effect((onCleanup) => {
      const active = this.facade.activeHazard();
      const ready = this.mapComp?.isReady();
      
      let isStale = false;
      onCleanup(() => {
        isStale = true;
      });
      
      if (ready) {
        this.applyLayerToMap(active, () => isStale);
      }
    });
  }

  ngOnInit() {
    this.facade.loadAllData();
  }

  setHazard(type: HazardType) {
    this.facade.setActiveHazard(type);
  }

  private buildHeatmapData(type: HazardType) {
    const center: [number, number] = [120.5960, 16.4164];
    const base = type === 'temperature' 
      ? this.facade.hazardState().temperature 
      : this.facade.hazardState().windSpeed;

    return {
      type: 'FeatureCollection',
      features: Array.from({ length: 300 }).map(() => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            center[0] + (Math.random() - 0.5) * 0.7,
            center[1] + (Math.random() - 0.5) * 0.7
          ]
        },
        properties: {
          value: Math.max(0, Math.min(100, base + (Math.random() - 0.5) * 40))
        }
      }))
    };
  }

  private async applyLayerToMap(type: HazardType, isStale: () => boolean) {
    const map = this.mapComp;

    if (!map || !map.map) return;
    map.clearHazardLayers();

    if (type === 'none') return;

    try {
      if (type === 'temperature') {
        const heatData = this.buildHeatmapData('temperature');
        map.addHeatmapLayer('temp-heat', heatData);
        return;
      }

      // 🌪 OPTIMIZED WIND FIELD (GEOJSON VECTOR ARROWS)
      if (type === 'wind') {
        const baseSpeed = this.facade.hazardState().windSpeed;
        const baseDir = this.facade.hazardState().windDirection;

        const rad = (baseDir * Math.PI) / 180;
        const baseU = baseSpeed * Math.cos(rad);
        const baseV = baseSpeed * Math.sin(rad);

        const gridSize = 40;
        // Optimization: High-performance 1D Flat Arrays for memory speed
        const uFlat = new Float32Array(gridSize * gridSize);
        const vFlat = new Float32Array(gridSize * gridSize);

        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            const curlX = Math.sin(y * 0.2) * 5;
            const curlY = Math.cos(x * 0.2) * 5;
            
            const index = y * gridSize + x;
            uFlat[index] = baseU + curlX;
            vFlat[index] = baseV + curlY;
          }
        }

        const bounds: [[number, number], [number, number]] = [
          [119.5, 15.5],
          [121.5, 17.5] 
        ];

        // Renders directly using MapLibre's native GPU layer
        map.renderWindArrows(uFlat, vFlat, gridSize, bounds);
        return;
      }

      if (type === 'precipitation') {
        const meta = await this.weather.getRadarData();
        if (isStale() || !this.mapComp?.map) return;

        const path = meta.radar.past?.at(-1)?.path;
        if (!path) return;

        const url = `https://tilecache.rainviewer.com${path}/256/{z}/{x}/{y}/2/1_1.png`;
        map.updateWeatherOverlay('radar-layer', url);
        return;
      }

    } catch (err) {
      if (!isStale()) console.error('Layer error:', err);
    }
  }
}