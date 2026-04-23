import { Component, AfterViewInit, ElementRef, ViewChild, Input, OnDestroy, NgZone, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-host w-100 h-100 position-relative bg-dark">
      <div #mapContainer class="map-view"></div>
      @if (!isReady()) {
        <div class="loader position-absolute inset-0 d-flex flex-column align-items-center justify-content-center bg-black">
          <div class="spinner-border text-info mb-3"></div>
          <span class="small fw-bold tracking-widest text-uppercase text-info">Booting Map Engine...</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .map-host { overflow: hidden; height: 100%; width: 100%; }
    .map-view { position: absolute; inset: 0; width: 100%; height: 100%; }
    .loader { z-index: 1000; }
    .tracking-widest { letter-spacing: 0.3em; }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() center: [number, number] = [120.5960, 16.4164];
  
  public isReady = signal<boolean>(false);
  public map: any;

  constructor(private zone: NgZone) {}

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => this.initMap());
  }

  private async initMap() {
    const win = window as any;
    if (!win.maplibregl) await this.loadScripts();

    this.map = new win.maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: this.center,
      zoom: 11.5,
      pitch: 45,
      antialias: true
    });

    this.map.on('load', () => {
      this.zone.run(() => {
        this.isReady.set(true);
        setTimeout(() => this.map.resize(), 200);
      });
    });
  }

  // --- RENDERING METHODS ---

  /**
   * REAL METEOROLOGY: ECMWF WIND OVERLAY
   * Directly taps into the European Centre for Medium-Range Weather Forecasts 
   * (ECMWF) IFS 0.4° model via Open-Meteo.
   */
  public addECMWFWindOverlay(opacity: number = 0.8) {
    if (!this.map || !this.isReady()) return;

    this.clearHazardLayers();
    const sourceId = 'wind-layer-src';
    const beforeId = this.getLabelLayerId();

    this.map.addSource(sourceId, {
      type: 'raster',
      tiles: ['https://maps.open-meteo.com/v1/forecast/wind_speed_10m/{z}/{x}/{y}.png?models=ecmwf_ifs04'],
      tileSize: 256,
      // CRITICAL FIX: maxzoom: 11 prevents WebGL crashes. 
      // It forces MapLibre to stretch the z11 tiles when zooming deeper, 
      // rather than requesting z12+ tiles that the API doesn't have.
      maxzoom: 11 
    });

    this.map.addLayer({
      id: 'wind-layer',
      type: 'raster',
      source: sourceId,
      paint: { 'raster-opacity': opacity, 'raster-fade-duration': 400 }
    }, beforeId);
  }

  public addHeatmapLayer(id: string, data: any) {
    if (!this.map || !this.isReady()) return;
    const sourceId = `${id}-src`;
    const beforeId = this.getLabelLayerId();

    this.map.addSource(sourceId, { type: 'geojson', data: data });
    this.map.addLayer({
      id: id,
      type: 'heatmap',
      source: sourceId,
      paint: {
        'heatmap-weight': ['get', 'value'],
        'heatmap-intensity': 1.5,
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0, 0, 255, 0)', 0.2, 'royalblue', 0.4, 'cyan',
          0.6, 'lime', 0.8, 'yellow', 1, 'red'
        ],
        'heatmap-radius': 40,
        'heatmap-opacity': 0.6
      }
    }, beforeId);
  }

  public updateWeatherOverlay(id: string, url: string, opacity: number = 0.75) {
    if (!this.map || !this.isReady()) return;

    this.clearHazardLayers();
    const sourceId = `${id}-src`;
    const beforeId = this.getLabelLayerId();

    this.map.addSource(sourceId, { 
      type: 'raster', 
      tiles: [url], 
      tileSize: 256,
      maxzoom: 12 // Prevents RainViewer deep-zoom 404 errors
    });

    this.map.addLayer({
      id: id, 
      type: 'raster', 
      source: sourceId,
      paint: { 'raster-opacity': opacity, 'raster-fade-duration': 400 }
    }, beforeId);
  }

  public clearHazardLayers() {
    if (!this.map) return;
    const layers = ['temp-layer', 'wind-layer', 'radar-layer', 'temp-heat', 'wind-heat'];
    layers.forEach(l => {
      if (this.map.getLayer(l)) this.map.removeLayer(l);
      if (this.map.getSource(`${l}-src`)) this.map.removeSource(`${l}-src`);
    });
  }

  private getLabelLayerId(): string | undefined {
    const layers = this.map.getStyle()?.layers;
    const found = layers?.find((l: any) => l.type === 'symbol');
    return found ? found.id : undefined;
  }

  private loadScripts(): Promise<void> {
    return new Promise(resolve => {
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  ngOnDestroy() { 
    if (this.map) this.map.remove(); 
  }
}