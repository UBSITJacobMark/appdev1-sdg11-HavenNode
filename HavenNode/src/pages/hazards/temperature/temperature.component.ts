import { Component, AfterViewInit, ViewChild, inject, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MapComponent } from '../../../components/map/map.component';
import { WeatherService } from '../../../services/weather.service';

@Component({
  selector: 'app-temperature',
  standalone: true,
  imports: [CommonModule, MapComponent, RouterLink],
  templateUrl: './temperature.component.html',
  styles: [`
    :host { display: block; height: 100vh; width: 100vw; }
    .hazard-mission-layout { height: 100%; font-family: var(--bs-font-monospace); }
    .mission-header { background: #080808; z-index: 10; position: relative; }
    .text-purple { color: #a855f7 !important; }
    .bg-purple { background-color: #a855f7 !important; }
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

    .analysis-legend { z-index: 100; min-width: 300px; backdrop-filter: blur(12px); }
    .thermal-gradient {
      height: 12px; border-radius: 1px;
      background: linear-gradient(90deg, #313695 0%, #4575b4 25%, #abd9e9 45%, #ffffbf 55%, #fdae61 75%, #d73027 100%) !important;
    }
    .telemetry-hud { z-index: 100; min-width: 240px; backdrop-filter: blur(12px); }
  `]
})
export class TemperatureComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapComp') mapComp!: MapComponent;
  private weather = inject(WeatherService);
  
  public benguetCenter: [number, number] = [120.5960, 16.4164];
  private hasInitialized = false;

  constructor() {
    /**
     * REACTIVE INITIALIZATION
     * We use an effect to watch for the MapComponent's Signal.
     * This replaces the brittle setInterval polling.
     */
    effect(() => {
      const isMapReady = this.mapComp?.isReady();
      if (isMapReady && !this.hasInitialized) {
        this.hasInitialized = true;
        this.runThermalMission();
      }
    });
  }

  ngAfterViewInit() {}

  private runThermalMission() {
    const map = this.mapComp.map;
    if (!map) return;

    // 1. Zoom into Benguet / Baguio focus
    map.flyTo({
      center: this.benguetCenter,
      zoom: 11,
      pitch: 35,
      essential: true
    });

    // 2. Inject GraphCast Layer
    const labelId = this.mapComp.getFirstLabelId();
    const url = this.weather.getGraphCastMapUrl('temperature_2m');

    if (!map.getSource('graphcast-src')) {
      map.addSource('graphcast-src', {
        type: 'raster',
        tiles: [url],
        tileSize: 256
      });

      map.addLayer({
        id: 'graphcast-layer',
        type: 'raster',
        source: 'graphcast-src',
        paint: { 'raster-opacity': 0.7 }
      }, labelId);
    }
  }

  ngOnDestroy() {}
}