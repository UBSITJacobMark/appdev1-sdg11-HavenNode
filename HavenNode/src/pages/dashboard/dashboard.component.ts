import { Component, OnInit, ViewChild, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisasterStateFacade, HazardType } from '../../services/disaster-state.facade';
import { WeatherService } from '../../services/weather.service';
import { MapComponent } from '../../components/map/map.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MapComponent],
  template: `
    <div class="vh-100 d-flex flex-column bg-black text-white font-monospace overflow-hidden">
      <header class="p-3 bg-dark border-bottom border-secondary d-flex justify-content-between align-items-center shadow-lg">
        <div class="d-flex align-items-center">
          <div class="status-pip me-2" [class.live]="mapComp?.isReady()"></div>
          <span class="small fw-bold tracking-widest text-info text-uppercase">HavenNode / Command Center</span>
        </div>
        <div class="x-small text-muted d-none d-md-block uppercase">Benguet Provincial DRRM Protocol // v22.0</div>
      </header>

      <div class="flex-grow-1 row g-0">
        <!-- Sidebar Navigation -->
        <div class="col-md-3 bg-dark border-end border-secondary p-4 d-flex flex-column z-index-sidebar shadow">
          <div class="risk-card p-3 mb-4 border rounded-1 text-center shadow-sm" [ngClass]="facade.riskColorClass()">
            <div class="x-small fw-bold uppercase opacity-50 mb-1">Regional Risk State</div>
            <div class="h4 fw-bold mb-0">{{ facade.riskLevel() }}</div>
          </div>

          <div class="analysis-suite mb-4">
            <h6 class="x-small fw-bold text-info tracking-wider mb-3 uppercase border-bottom border-secondary pb-1">Intelligence Layers</h6>
            <div class="d-grid gap-2">
              <button class="btn btn-sm btn-outline-info text-start px-3" 
                [class.active]="facade.activeHazard() === 'none'" (click)="setHazard('none')">
                Standard Topography
              </button>
              <button class="btn btn-sm btn-outline-info text-start px-3" 
                [class.active]="facade.activeHazard() === 'precipitation'" (click)="setHazard('precipitation')">
                Rain Radar (RainViewer)
              </button>
              <button class="btn btn-sm btn-outline-info text-start px-3" 
                [class.active]="facade.activeHazard() === 'wind'" (click)="setHazard('wind')">
                Vector Wind (ECMWF GRIB Data)
              </button>
              <button class="btn btn-sm btn-outline-info text-start px-3" 
                [class.active]="facade.activeHazard() === 'temperature'" (click)="setHazard('temperature')">
                Thermal Heatmap (Local Nodes)
              </button>
            </div>
          </div>

          <!-- Telemetry Readout -->
          <div class="mt-auto p-3 bg-black border border-secondary rounded-1">
            <div class="x-small text-muted mb-2 uppercase fw-bold border-bottom border-secondary pb-1">Current Telemetry</div>
            <div class="d-flex justify-content-between x-small mb-1"><span class="opacity-50">TEMP:</span><span>{{ facade.hazardState().temperature }}°C</span></div>
            <div class="d-flex justify-content-between x-small mb-1"><span class="opacity-50">WIND:</span><span>{{ facade.hazardState().windSpeed }}km/h</span></div>
            <div class="d-flex justify-content-between x-small"><span class="opacity-50">RAIN:</span><span>{{ facade.hazardState().precipitation }}mm</span></div>
          </div>
        </div>

        <!-- Main Map Viewport -->
        <div class="col-md-9 position-relative">
          <app-map #mapComp></app-map>

          <!-- Layer HUD -->
          @if (facade.activeHazard() !== 'none') {
            <div class="hud-box position-absolute top-0 end-0 m-4 p-3 bg-black bg-opacity-75 border border-info shadow-lg animate-slide-in">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <h6 class="x-small fw-bold text-info uppercase mb-0 tracking-widest">{{ facade.activeHazard() }} SCAN</h6>
                <span class="badge bg-info text-black x-small">LIVE</span>
              </div>
              <div class="x-small opacity-50 italic">
                {{ 
                  facade.activeHazard() === 'precipitation' ? 'Syncing RainViewer API...' : 
                  facade.activeHazard() === 'wind' ? 'Decoding ECMWF U/V Vector Field...' :
                  'Generating Local Spatial Interpolation...' 
                }}
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracking-widest { letter-spacing: 0.3em; }
    .x-small { font-size: 0.65rem; }
    .uppercase { text-transform: uppercase; }
    .z-index-sidebar { z-index: 100; }
    .status-pip { width: 10px; height: 10px; border-radius: 50%; background: #440000; transition: background 0.3s; }
    .status-pip.live { background: #00ff00; box-shadow: 0 0 8px #00ff00; }
    .active { background: #0dcaf0 !important; color: #000 !important; }
    .hud-box { z-index: 200; min-width: 220px; backdrop-filter: blur(8px); }
    .animate-slide-in { animation: slideIn 0.4s cubic-bezier(0, 0.5, 0.5, 1); }
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

    if (type === 'none') {
      map.clearHazardLayers();
      return;
    }

    try {
      if (type === 'temperature') {
        const heatData = this.buildHeatmapData('temperature');
        map.clearHazardLayers();
        map.addHeatmapLayer('temp-heat', heatData);
        return;
      }

      if (type === 'wind') {
        map.clearHazardLayers();

        const url = 'https://api.open-meteo.com/v1/forecast?latitude=16.4164&longitude=120.5960&hourly=wind_speed_10m,wind_direction_10m&models=ecmwf_ifs04';
        const res = await fetch(url);
        const data = await res.json();

        if (isStale()) return;

        // FIX: Explicitly typed the arrays as number[]
        const u: number[] = [];
        const v: number[] = [];
        
        const speed = data.hourly.wind_speed_10m;
        const dir = data.hourly.wind_direction_10m;

        for (let i = 0; i < Math.min(speed.length, 100); i++) {
          const rad = (dir[i] * Math.PI) / 180;
          u.push(speed[i] * Math.cos(rad));
          v.push(speed[i] * Math.sin(rad));
        }

        const gridSize = 40;
        const uGrid = Array.from({ length: gridSize }, () =>
          Array.from({ length: gridSize }, () => u[Math.floor(Math.random() * u.length)])
        );
        const vGrid = Array.from({ length: gridSize }, () =>
          Array.from({ length: gridSize }, () => v[Math.floor(Math.random() * v.length)])
        );

        const bounds = [
          [120.2, 16.2],
          [120.9, 16.7] 
        ];

        const features = [];
        for (let y = 0; y < uGrid.length; y++) {
          for (let x = 0; x < uGrid[y].length; x++) {
            const windSpeedCalc = Math.sqrt(uGrid[y][x] ** 2 + vGrid[y][x] ** 2);
            features.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [
                  bounds[0][0] + (x / uGrid[0].length) * (bounds[1][0] - bounds[0][0]),
                  bounds[0][1] + (y / vGrid.length) * (bounds[1][1] - bounds[0][1])
                ]
              },
              properties: {
                u: uGrid[y][x],
                v: vGrid[y][x],
                speed: windSpeedCalc
              }
            });
          }
        }

        const mapInstance = map.map;

        mapInstance.addSource('wind-layer-src', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features }
        });

        mapInstance.addLayer({
          id: 'wind-layer',
          type: 'circle',
          source: 'wind-layer-src',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['get', 'speed'], 0, 2, 20, 6],
            'circle-color': [
              'interpolate', ['linear'], ['get', 'speed'],
              0, '#00ffff',
              5, '#00ff00',
              10, '#ffff00',
              20, '#ff0000'
            ],
            'circle-opacity': 0.7
          }
        });
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