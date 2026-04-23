import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisasterStateFacade } from '../../services/disaster-state.facade';
import { MapComponent } from '../../components/map/map.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MapComponent],
  template: `
    <div class="container-fluid dashboard-layout p-0">
      <div class="row h-100 g-0">
        
        <!-- Sidebar: Focused on Risk and Forecasts -->
        <div class="col-md-4 col-lg-3 d-flex flex-column p-3 bg-white border-end sidebar-container shadow-sm">
          
          @if (facade.isLoading()) {
            <div class="text-center py-5">
              <div class="spinner-border text-primary mb-2"></div>
              <p class="text-muted small fw-bold">ORCHESTRATING DATA STREAMS...</p>
            </div>
          } @else if (facade.hazardState(); as data) {
            
            <!-- Risk Level Header -->
            <div class="card mb-3 border-0 shadow-sm overflow-hidden rounded-0" [ngClass]="facade.riskColorClass()">
              <div class="card-body text-center py-3">
                <h6 class="text-uppercase fw-bold opacity-75 mb-1 small tracking-widest">BENGUET RISK STATUS</h6>
                <h2 class="fw-bold mb-0">{{ facade.riskLevel() }}</h2>
                <div class="mt-2 small opacity-75">Last sync: {{ data.timestamp }}</div>
              </div>
            </div>

            <!-- Forecast View Toggle -->
            <div class="btn-group btn-group-sm w-100 mb-3 rounded-0 shadow-sm">
              <button class="btn py-2" [class.btn-primary]="facade.forecastView() === 'daily'" 
                [class.btn-outline-primary]="facade.forecastView() !== 'daily'"
                (click)="facade.setForecastView('daily')">Daily Detail</button>
              <button class="btn py-2" [class.btn-primary]="facade.forecastView() === 'tenday'" 
                [class.btn-outline-primary]="facade.forecastView() !== 'tenday'"
                (click)="facade.setForecastView('tenday')">10-Day Trend</button>
            </div>

            <!-- Dynamic Forecast List -->
            <div class="card border-0 mb-3 flex-grow-1 overflow-hidden">
              <div class="card-body p-0 outlook-scroll h-100">
                <div class="list-group list-group-flush">
                  @if (facade.forecastView() === 'daily') {
                    @for (h of facade.forecastState()?.todayHourly; track h.time) {
                      <div class="list-group-item d-flex justify-content-between py-2 align-items-center border-0 border-bottom">
                        <span class="small text-muted">{{ h.time | date:'ha' }}</span>
                        <div class="d-flex align-items-center">
                          <span class="fw-bold me-2">{{ h.rain }}<small>mm</small></span>
                          <div class="bg-info" [style.height.px]="4" [style.width.px]="h.rain * 5"></div>
                        </div>
                      </div>
                    }
                  } @else {
                    @for (item of facade.forecastState()?.daily; track item.date) {
                      <div class="list-group-item d-flex justify-content-between py-2 align-items-center border-0 border-bottom">
                        <div class="small d-flex flex-column">
                          <span class="fw-bold">{{ item.date | date:'EEE, MMM d' }}</span>
                          <span class="text-muted x-small">{{ item.probability }}% PROBABILITY</span>
                        </div>
                        <span class="badge" [class.bg-danger]="item.rainSum > 15" [class.bg-secondary]="item.rainSum <= 15">
                          {{ item.rainSum }}mm
                        </span>
                      </div>
                    }
                  }
                </div>
              </div>
            </div>

            <!-- Branding Footer -->
            <div class="mt-auto py-2 text-center border-top">
              <p class="text-muted x-small mb-0 fw-bold">HAVENNODE CORE v21.2</p>
              <p class="text-muted x-small">SDG 11 Resiliency Framework</p>
            </div>
          }
        </div>

        <!-- Edge-to-Edge Map Column -->
        <div class="col-md-8 col-lg-9 h-100 position-relative bg-light">
          
          <!-- Floating Hamburger Menu Button -->
          <button class="btn btn-dark floating-menu-btn shadow-lg d-flex align-items-center justify-content-center" 
                  (click)="toggleOverlayMenu()"
                  [title]="isOverlayOpen() ? 'Close Layers' : 'Open Layers'">
            @if (isOverlayOpen()) {
              <span class="fs-4">×</span>
            } @else {
              <div class="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            }
          </button>

          <!-- Floating Overlay Menu Content -->
          <div class="layer-overlay-card shadow-lg bg-dark text-white rounded-0" [class.active]="isOverlayOpen()">
            <div class="card-header bg-transparent border-secondary py-3 px-4 d-flex justify-content-between align-items-center">
              <span class="small fw-bold text-uppercase tracking-widest">Geospatial Control</span>
            </div>
            <div class="card-body p-4 overflow-auto" style="max-height: 80vh;">
              
              <!-- Hazard Section -->
              <div class="mb-4">
                <div class="text-info x-small fw-bold mb-3 text-uppercase border-bottom border-secondary pb-1">Hazard Boundaries</div>
                <div class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" role="switch" id="fToggle" checked 
                         (change)="onToggleLayer('flood-inundation-layer')">
                  <label class="form-check-label small" for="fToggle">Flood Risk (Project NOAH)</label>
                </div>
              </div>

              <!-- Atmospheric Section -->
              <div class="mb-4">
                <div class="text-info x-small fw-bold mb-3 text-uppercase border-bottom border-secondary pb-1">Live Conditions</div>
                <div class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" role="switch" id="rToggle" 
                         (change)="onToggleLayer('weather-radar-layer')">
                  <label class="form-check-label small" for="rToggle">Precipitation (Radar)</label>
                </div>
                <div class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" role="switch" id="sToggle" 
                         (change)="onToggleLayer('weather-satellite-layer')">
                  <label class="form-check-label small" for="sToggle">Humidity (Cloud IR)</label>
                </div>
              </div>

              <!-- Metrics Section -->
              <div>
                <div class="text-info x-small fw-bold mb-3 text-uppercase border-bottom border-secondary pb-1">Global Overlays</div>
                <div class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" role="switch" id="wToggle" 
                         (change)="onToggleLayer('weather-wind-layer')">
                  <label class="form-check-label small" for="wToggle">Wind Magnitude</label>
                </div>
                <div class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" role="switch" id="tToggle" 
                         (change)="onToggleLayer('weather-temp-layer')">
                  <label class="form-check-label small" for="tToggle">Temperature Heatmap</label>
                </div>
              </div>

            </div>
          </div>

          <app-map #hazardMap></app-map>
        </div>
        
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout { 
      height: calc(100vh - 56px); 
      overflow: hidden; 
      background: #f4f4f4;
    }
    .sidebar-container { 
      height: 100%; 
      z-index: 10; 
      border-right: 1px solid #ddd;
    }
    .outlook-scroll { 
      scrollbar-width: thin;
      overflow-y: auto;
    }
    .x-small { font-size: 0.65rem; }
    .tracking-widest { letter-spacing: 0.15em; }
    .h-100 { height: 100% !important; }

    /* Floating Toggle UI */
    .floating-menu-btn {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 100;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .floating-menu-btn:hover {
      transform: scale(1.1);
      background-color: #000;
    }

    .hamburger-icon {
      width: 20px;
      height: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .hamburger-icon span {
      display: block;
      height: 2px;
      width: 100%;
      background: white;
      border-radius: 2px;
    }

    /* Layer Overlay Card */
    .layer-overlay-card {
      position: absolute;
      top: 80px;
      right: 20px;
      width: 280px;
      z-index: 99;
      transform: translateX(120%);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
      visibility: hidden;
    }
    .layer-overlay-card.active {
      transform: translateX(0);
      opacity: 1;
      visibility: visible;
    }

    .form-check-input:checked { background-color: #2780E3; border-color: #2780E3; }
    .text-info { color: #5bc0de !important; }
  `]
})
export class DashboardComponent implements OnInit {
  public facade = inject(DisasterStateFacade);
  @ViewChild('hazardMap') mapComponent!: MapComponent;

  // Signal to track menu visibility
  isOverlayOpen = signal(false);

  ngOnInit() {
    this.facade.loadInitialData();
  }

  toggleOverlayMenu() {
    this.isOverlayOpen.set(!this.isOverlayOpen());
  }

  onToggleLayer(id: string) {
    if (this.mapComponent) {
      this.mapComponent.toggleLayer(id);
    }
  }
}