import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { DisasterStateFacade } from '../../services/disaster-state.facade';
import { MapComponent } from '../../components/map/map.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MapComponent, RouterLink],
  template: `
    <div class="container-fluid dashboard-layout p-0">
      <div class="row h-100 g-0">
        
        <!-- SIDEBAR: Unified Risk Intelligence -->
        <div class="col-md-4 col-lg-3 d-flex flex-column p-3 bg-white border-end sidebar-container shadow-sm">
          
          @if (facade.isLoading()) {
            <div class="text-center py-5">
              <div class="spinner-border text-primary mb-2"></div>
              <p class="text-muted small fw-bold tracking-wider">SYNCING COMMAND CENTER...</p>
            </div>
          } @else if (facade.hazardState(); as data) {
            
            <!-- Unified Risk Level -->
            <div class="card mb-3 border-0 shadow-sm overflow-hidden rounded-0" [ngClass]="facade.riskColorClass()">
              <div class="card-body text-center py-3">
                <h6 class="text-uppercase fw-bold opacity-75 mb-1 small tracking-widest">BENGUET SYSTEM STATE</h6>
                <h2 class="fw-bold mb-0 h3">{{ facade.riskLevel() }}</h2>
                <div class="mt-2 x-small opacity-75">Last Packet: {{ data.timestamp }}</div>
              </div>
            </div>

            <!-- Dashboard Analytics Toggle -->
            <div class="btn-group btn-group-sm w-100 mb-3 rounded-0 shadow-sm">
              <button class="btn py-2" [class.btn-primary]="facade.forecastView() === 'daily'" 
                [class.btn-outline-primary]="facade.forecastView() !== 'daily'"
                (click)="facade.setForecastView('daily')">Hourly</button>
              <button class="btn py-2" [class.btn-primary]="facade.forecastView() === 'tenday'" 
                [class.btn-outline-primary]="facade.forecastView() !== 'tenday'"
                (click)="facade.setForecastView('tenday')">10-Day</button>
            </div>

            <!-- Contextual Forecast List -->
            <div class="card border-0 mb-3 flex-grow-1 overflow-hidden">
              <div class="card-body p-0 outlook-scroll h-100">
                <div class="list-group list-group-flush">
                  @if (facade.forecastView() === 'daily') {
                    @for (h of facade.forecastState()?.todayHourly; track h.time) {
                      <div class="list-group-item d-flex justify-content-between py-2 align-items-center border-0 border-bottom bg-transparent">
                        <span class="small text-muted">{{ h.time | date:'ha' }}</span>
                        <div class="d-flex align-items-center">
                          <span class="fw-bold me-2 small">{{ h.rain }}<small>mm</small></span>
                          <div class="bg-info" [style.height.px]="3" [style.width.px]="h.rain * 4"></div>
                        </div>
                      </div>
                    }
                  } @else {
                    @for (item of facade.forecastState()?.daily; track item.date) {
                      <div class="list-group-item d-flex justify-content-between py-2 align-items-center border-0 border-bottom bg-transparent">
                        <div class="small d-flex flex-column">
                          <span class="fw-bold">{{ item.date | date:'EEE, MMM d' }}</span>
                          <span class="text-muted x-small uppercase">{{ item.probability }}% PROBABILITY</span>
                        </div>
                        <span class="badge rounded-pill" [class.bg-danger]="item.rainSum > 15" [class.bg-secondary]="item.rainSum <= 15">
                          {{ item.rainSum }}mm
                        </span>
                      </div>
                    }
                  }
                </div>
              </div>
            </div>

            <div class="mt-auto py-2 text-center border-top bg-light">
              <p class="text-muted x-small mb-0 fw-bold tracking-widest">HAVENNODE CORE / PDRRMO</p>
            </div>
          }
        </div>

        <!-- MAIN VIEWPORT: Map with Floating Mission Selector -->
        <div class="col-md-8 col-lg-9 h-100 position-relative bg-light">
          
          <!-- Hamburger Button: Mission Selector -->
          <button class="btn btn-dark floating-hamburger shadow-lg" 
                  (click)="toggleMenu()"
                  [title]="isMenuOpen() ? 'Close Selector' : 'Open Mission Selector'">
            @if (isMenuOpen()) {
              <span class="fs-4">&times;</span>
            } @else {
              <div class="hamburger-lines">
                <span></span>
                <span></span>
                <span></span>
              </div>
            }
          </button>

          <!-- Floating Mission Selector Overlay -->
          <div class="mission-overlay-card shadow-lg bg-black text-white" [class.active]="isMenuOpen()">
            <div class="card-header border-secondary py-3 px-4">
              <span class="small fw-bold text-info tracking-widest text-uppercase">Hazard Analysis Mission</span>
            </div>
            <div class="card-body p-4">
              
              <div class="mb-4">
                <p class="x-small text-muted mb-3 tracking-wider fw-bold text-uppercase border-bottom border-secondary pb-1">Geospatial Deep-Dives</p>
                
                <!-- Navigation Buttons instead of Toggles -->
                <div class="d-grid gap-2">
                  <a routerLink="/hazards/flood" class="btn btn-sm btn-outline-light text-start py-2 d-flex justify-content-between align-items-center">
                    <span>Flood Inundation Zone</span>
                    <i class="bi bi-chevron-right x-small"></i>
                  </a>
                  <a routerLink="/hazards/precipitation" class="btn btn-sm btn-outline-light text-start py-2 d-flex justify-content-between align-items-center">
                    <span>Rain Intensity (Radar)</span>
                    <i class="bi bi-chevron-right x-small"></i>
                  </a>
                  <a routerLink="/hazards/humidity" class="btn btn-sm btn-outline-light text-start py-2 d-flex justify-content-between align-items-center">
                    <span>Humidity & Cloud IR</span>
                    <i class="bi bi-chevron-right x-small"></i>
                  </a>
                  <a routerLink="/hazards/wind" class="btn btn-sm btn-outline-light text-start py-2 d-flex justify-content-between align-items-center">
                    <span>Wind Magnitude Vectors</span>
                    <i class="bi bi-chevron-right x-small"></i>
                  </a>
                  <a routerLink="/hazards/temperature" class="btn btn-sm btn-outline-light text-start py-2 d-flex justify-content-between align-items-center">
                    <span>Thermal Heatmap Analysis</span>
                    <i class="bi bi-chevron-right x-small"></i>
                  </a>
                </div>
              </div>

              <div class="p-3 bg-secondary bg-opacity-25 border border-secondary rounded-1">
                <p class="x-small mb-0 text-muted italic">Selecting a mission will transition the engine to an isolated, high-resolution analysis environment for that specific threat vector.</p>
              </div>

            </div>
          </div>

          <app-map #hazardMap></app-map>
        </div>
        
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout { height: calc(100vh - 56px); overflow: hidden; background: #f8f9fa; }
    .sidebar-container { height: 100%; z-index: 10; }
    .outlook-scroll { scrollbar-width: thin; overflow-y: auto; }
    .x-small { font-size: 0.65rem; }
    .tracking-widest { letter-spacing: 0.15em; }
    .tracking-wider { letter-spacing: 0.1em; }
    .bg-black { background-color: #000 !important; }
    .h-100 { height: 100% !important; }

    /* Floating Hamburger Button */
    .floating-hamburger {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 1000;
      width: 48px;
      height: 48px;
      border-radius: 4px;
      border: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .floating-hamburger:hover { background: #111; transform: translateY(-1px); }

    .hamburger-lines {
      width: 18px;
      height: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .hamburger-lines span {
      display: block;
      height: 2px;
      width: 100%;
      background: white;
    }

    /* Mission Overlay Card */
    .mission-overlay-card {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 320px;
      z-index: 999;
      border-radius: 4px;
      transform: translateX(110%);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0;
      visibility: hidden;
      border: 1px solid #333;
    }
    .mission-overlay-card.active {
      transform: translateX(0);
      opacity: 1;
      visibility: visible;
    }

    .btn-outline-light:hover { background: #333; color: #0dcaf0; border-color: #0dcaf0; }
  `]
})
export class DashboardComponent implements OnInit {
  public facade = inject(DisasterStateFacade);
  public isMenuOpen = signal(false);

  ngOnInit() {
    this.facade.loadInitialData();
  }

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }
}