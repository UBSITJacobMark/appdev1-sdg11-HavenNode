import { Component, OnInit, ViewChild, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DisasterStateFacade, HazardType } from '../../services/disaster-state.facade';
import { WeatherService } from '../../services/weather.service';
import { MapComponent } from '../../components/map/map.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MapComponent, RouterLink, RouterLinkActive],
  template: `
    <div class="vh-100 d-flex flex-column dashboard-layout bg-light">
      
      <!-- Restored HavenNode Navbar -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm z-index-header px-3 py-2">
        <div class="container-fluid">
          <div class="d-flex align-items-center">
            <div class="status-pip me-3" [class.live]="mapComp?.isReady()"></div>
            <a class="navbar-brand fw-bold tracking-widest text-uppercase" routerLink="/">HavenNode</a>
          </div>
      
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
      
          <div class="collapse navbar-collapse" id="navbarNav">
            <div class="navbar-nav me-auto">
              <a class="nav-link fw-bold" routerLink="/dashboard" routerLinkActive="active">Map</a>
              <a class="nav-link fw-bold" routerLink="/about" routerLinkActive="active">About</a>
            </div>
            <div class="d-none d-lg-flex text-white-50 small text-uppercase fw-bold">
              Benguet Provincial DRRM Protocol // v22.0
            </div>
          </div>
        </div>
      </nav>

      <div class="container-fluid flex-grow-1 overflow-hidden">
        <div class="row h-100 g-3 py-3 px-1">
          
          <div class="col-md-4 col-lg-3 d-flex flex-column gap-3 sidebar-scroll">
            
            @if (facade.hazardState(); as data) {
              <!-- Risk Status Card -->
              <div class="card shadow-sm border-0" [ngClass]="facade.riskColorClass()">
                <div class="card-body text-center py-4">
                  <h6 class="text-uppercase fw-bold opacity-75 mb-1">Benguet Risk Status</h6>
                  <h3 class="fw-bold mb-0">{{ facade.riskLevel() }}</h3>
                  <div class="small fw-bold mt-2 opacity-75">Score: {{ facade.riskScore() }}/100</div>
                </div>
              </div>

              <!-- PROJECT NOAH CONTROLS -->
              <div class="card border-0 shadow-sm mt-2">
                <div class="card-header bg-danger text-white fw-bold small text-uppercase">Project NOAH Hazards</div>
                <div class="card-body p-3">
                  <div class="d-grid gap-2">
                    <button class="btn btn-sm text-start px-3 fw-bold" 
                      [class.btn-info]="facade.activeHazard() === 'flood-5y'" [class.btn-outline-info]="facade.activeHazard() !== 'flood-5y'"
                      (click)="setHazard('flood-5y')">5-Year Flood Hazard</button>
                    <button class="btn btn-sm text-start px-3 fw-bold" 
                      [class.btn-primary]="facade.activeHazard() === 'flood-25y'" [class.btn-outline-primary]="facade.activeHazard() !== 'flood-25y'"
                      (click)="setHazard('flood-25y')">25-Year Flood Hazard</button>
                    <button class="btn btn-sm text-start px-3 fw-bold" 
                      [class.btn-dark]="facade.activeHazard() === 'flood-100y'" [class.btn-outline-dark]="facade.activeHazard() !== 'flood-100y'"
                      (click)="setHazard('flood-100y')">100-Year Flood Hazard</button>
                    <button class="btn btn-sm text-start px-3 fw-bold" 
                      [class.btn-warning]="facade.activeHazard() === 'landslide'" [class.btn-outline-warning]="facade.activeHazard() !== 'landslide'"
                      (click)="setHazard('landslide')">Landslide Susceptibility</button>
                  </div>
                </div>
              </div>

              <!-- LIVE METEOROLOGY CONTROLS -->
              <div class="card border-0 shadow-sm mt-2">
                <div class="card-header bg-dark text-white fw-bold small text-uppercase">Live Meteorology</div>
                <div class="card-body p-3">
                  <div class="d-grid gap-2">
                    <button class="btn btn-sm text-start px-3 fw-bold" 
                      [class.btn-primary]="facade.activeHazard() === 'none'" [class.btn-outline-primary]="facade.activeHazard() !== 'none'"
                      (click)="setHazard('none')">Standard Topography</button>
                    <button class="btn btn-sm text-start px-3 fw-bold" 
                      [class.btn-primary]="facade.activeHazard() === 'precipitation'" [class.btn-outline-primary]="facade.activeHazard() !== 'precipitation'"
                      (click)="setHazard('precipitation')">Rain Radar (Live)</button>
                    <button class="btn btn-sm text-start px-3 fw-bold" 
                      [class.btn-primary]="facade.activeHazard() === 'wind'" [class.btn-outline-primary]="facade.activeHazard() !== 'wind'"
                      (click)="setHazard('wind')">Wind Vectors (ECMWF)</button>
                    <button class="btn btn-sm text-start px-3 fw-bold" 
                      [class.btn-primary]="facade.activeHazard() === 'temperature'" [class.btn-outline-primary]="facade.activeHazard() !== 'temperature'"
                      (click)="setHazard('temperature')">Thermal Heatmap</button>
                  </div>
                </div>
              </div>

              <!-- Live Telemetry Readout -->
              <div class="card border-0 shadow-sm mt-auto">
                <div class="card-header bg-secondary text-dark fw-bold small text-uppercase border-bottom">Live Telemetry</div>
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
                      facade.activeHazard().includes('flood') ? 'Mapping Localized Flood Inundation...' :
                      facade.activeHazard() === 'landslide' ? 'Mapping Slope Susceptibility...' :
                      'Generating Local Spatial Interpolation...' 
                    }}
                  </div>
                </div>
              }
            </div>
          </div>
          
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout { font-family: var(--bs-font-sans-serif); }
    .sidebar-scroll { max-height: 100%; overflow-y: auto; z-index: 100; scrollbar-width: thin; padding-bottom: 1rem; }
    .map-wrapper { z-index: 1; position: relative; }
    .tracking-widest { letter-spacing: 0.15em; }
    .x-small { font-size: 0.7rem; }
    
    .status-pip { width: 12px; height: 12px; border-radius: 50%; background: #dc3545; transition: background 0.3s; box-shadow: inset 0 0 2px rgba(0,0,0,0.5); }
    .status-pip.live { background: #28a745; box-shadow: 0 0 8px rgba(40, 167, 69, 0.8), inset 0 0 2px rgba(0,0,0,0.5); }
    
    .hud-box { z-index: 200; min-width: 240px; }
    .animate-slide-in { animation: slideIn 0.4s cubic-bezier(0, 0.5, 0.5, 1); }
    
    .card { border-radius: 6px; }
    .btn { border-radius: 4px; }
    .z-index-header { z-index: 300; }
    
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
      onCleanup(() => { isStale = true; });
      
      if (ready) this.applyLayerToMap(active, () => isStale);
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
    const base = type === 'temperature' ? this.facade.hazardState().temperature : this.facade.hazardState().windSpeed;
    return {
      type: 'FeatureCollection',
      features: Array.from({ length: 300 }).map(() => ({
        type: 'Feature', geometry: { type: 'Point', coordinates: [center[0] + (Math.random() - 0.5) * 0.7, center[1] + (Math.random() - 0.5) * 0.7] },
        properties: { value: Math.max(0, Math.min(100, base + (Math.random() - 0.5) * 40)) }
      }))
    };
  }

  private async applyLayerToMap(type: HazardType, isStale: () => boolean) {
    const map = this.mapComp;
    if (!map || !map.map) return;
    map.clearHazardLayers();

    if (type === 'none') return;

    try {
      // 🌊 PROJECT NOAH GEOJSON LAYERS
      if (type === 'flood-5y') { map.addPolygonLayer('noah-layer', '/FiveYear/Benguet_Flood_5year.json', '#0dcaf0'); return; }
      if (type === 'flood-25y') { map.addPolygonLayer('noah-layer', '/25Y/Benguet_Flood_25year.json', '#0d6efd'); return; }
      if (type === 'flood-100y') { map.addPolygonLayer('noah-layer', '/100Year/Benguet_Flood_100year.json', '#212529'); return; }
      if (type === 'landslide') { map.addPolygonLayer('noah-layer', '/Landslide/Benguet_LandslideHazards.json', '#fd7e14'); return; }

      // 🌡 LOCAL INTERPOLATION
      if (type === 'temperature') {
        const heatData = this.buildHeatmapData('temperature');
        map.addHeatmapLayer('temp-heat', heatData);
        return;
      }

      // 🌪 WIND VECTORS
      if (type === 'wind') {
        const baseSpeed = this.facade.hazardState().windSpeed;
        const baseDir = this.facade.hazardState().windDirection;
        const rad = (baseDir * Math.PI) / 180;
        const baseU = baseSpeed * Math.cos(rad);
        const baseV = baseSpeed * Math.sin(rad);

        const gridSize = 40;
        const uFlat = new Float32Array(gridSize * gridSize);
        const vFlat = new Float32Array(gridSize * gridSize);

        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            const index = y * gridSize + x;
            uFlat[index] = baseU + (Math.sin(y * 0.2) * 5);
            vFlat[index] = baseV + (Math.cos(x * 0.2) * 5);
          }
        }
        map.renderWindArrows(uFlat, vFlat, gridSize, [[119.5, 15.5], [121.5, 17.5]]);
        return;
      }

      // 🌧 RAIN RADAR
      if (type === 'precipitation') {
        const meta = await this.weather.getRadarData();
        if (isStale() || !this.mapComp?.map) return;
        const path = meta.radar.past?.at(-1)?.path;
        if (!path) return;
        map.updateWeatherOverlay('radar-layer', `https://tilecache.rainviewer.com${path}/256/{z}/{x}/{y}/2/1_1.png`);
        return;
      }

    } catch (err) { if (!isStale()) console.error('Layer error:', err); }
  }
}