import { Component, AfterViewInit, ElementRef, ViewChild, Input, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-wrapper h-100 w-100">
      @if (!isMapReady) {
        <div class="loading-overlay">
          <div class="spinner-border text-primary"></div>
          <span class="ms-2">Initializing HavenNode Map...</span>
        </div>
      }
      <div #mapContainer class="map-container" [style.opacity]="isMapReady ? 1 : 0"></div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
    .map-wrapper { position: relative; background: #eee; overflow: hidden; }
    .map-container { position: absolute; inset: 0; transition: opacity 0.5s; }
    .loading-overlay { 
      position: absolute; 
      inset: 0; 
      z-index: 5; 
      display: flex; 
      flex-direction: column;
      align-items: center; 
      justify-content: center; 
      background: #fff; 
    }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() center: [number, number] = [120.5828, 16.4550];
  
  private map: any;
  public isMapReady = false;

  constructor(private zone: NgZone, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.loadMapLibre().then(m => this.zone.runOutsideAngular(() => this.initMap(m)));
  }

  private async loadMapLibre(): Promise<any> {
    const win = window as any;
    if (win.maplibregl) return win.maplibregl;
    return new Promise(resolve => {
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
      script.onload = () => resolve(win.maplibregl);
      document.body.appendChild(script);
    });
  }

  private initMap(maplibregl: any) {
    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: this.center, zoom: 13.5, pitch: 45, bearing: -17, maxZoom: 18
    });

    this.map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    this.map.on('load', async () => {
      // Find the first label layer to insert weather beneath it
      const layers = this.map.getStyle().layers;
      let firstLabelId = '';
      for (const layer of layers) {
        if (layer.type === 'symbol') {
          firstLabelId = layer.id;
          break;
        }
      }

      this.addLayers(maplibregl, firstLabelId);
      await this.addWeatherOverlays(firstLabelId);
      
      this.zone.run(() => {
        this.isMapReady = true;
        this.cdr.detectChanges();
        setTimeout(() => this.map.resize(), 100);
      });
    });
  }

  private addLayers(maplibregl: any, beforeId: string) {
    new maplibregl.Marker({ color: '#2780E3' }).setLngLat(this.center).addTo(this.map);
    
    this.map.addSource('flood', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[120.575, 16.445], [120.590, 16.445], [120.595, 16.460], [120.585, 16.470], [120.570, 16.460], [120.575, 16.445]]]
          }
        }]
      }
    });

    // Place flood on top of weather but below labels
    this.map.addLayer({ 
      id: 'flood-inundation-layer', 
      type: 'fill', 
      source: 'flood', 
      layout: { 'visibility': 'visible' }, 
      paint: { 'fill-color': '#FF0039', 'fill-opacity': 0.4 } 
    }, beforeId);
  }

  private async addWeatherOverlays(beforeId: string) {
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      const data = await res.json();
      const owmKey = '8b38a7985392d7705600609b533e46c7'; 

      // 1. Temperature (Heatmap - Bottom-most)
      this.map.addSource('owm-temp', {
        type: 'raster',
        tiles: [`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${owmKey}`],
        tileSize: 256
      });
      this.map.addLayer({
        id: 'weather-temp-layer', type: 'raster', source: 'owm-temp',
        layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.6 }
      }, 'flood-inundation-layer');

      // 2. Humidity/Clouds (Satellite Infrared)
      if (data.satellite && data.satellite.infrared) {
        const satPath = data.satellite.infrared[data.satellite.infrared.length - 1].path;
        this.map.addSource('satellite', {
          type: 'raster',
          tiles: [`https://tilecache.rainviewer.com${satPath}/256/{z}/{x}/{y}/2/1_1.png`],
          tileSize: 256, maxzoom: 16
        });
        this.map.addLayer({
          id: 'weather-satellite-layer', type: 'raster', source: 'satellite',
          layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.5 }
        }, 'weather-temp-layer');
      }

      // 3. Wind Magnitude
      this.map.addSource('owm-wind', {
        type: 'raster',
        tiles: [`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${owmKey}`],
        tileSize: 256
      });
      this.map.addLayer({
        id: 'weather-wind-layer', type: 'raster', source: 'owm-wind',
        layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.6 }
      }, 'weather-satellite-layer');

      // 4. Precipitation (Radar - Top of weather stack)
      const radarPath = data.radar.past[data.radar.past.length - 1].path;
      this.map.addSource('radar', {
        type: 'raster',
        tiles: [`https://tilecache.rainviewer.com${radarPath}/256/{z}/{x}/{y}/2/1_1.png`],
        tileSize: 256, maxzoom: 16
      });
      this.map.addLayer({
        id: 'weather-radar-layer', type: 'raster', source: 'radar',
        layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.6 }
      }, 'weather-wind-layer');

    } catch (e) { console.warn('Weather layers initialization failed:', e); }
  }

  public toggleLayer(id: string) {
    if (!this.map || !this.isMapReady) return;
    if (!this.map.getLayer(id)) return;
    
    const vis = this.map.getLayoutProperty(id, 'visibility');
    const nextVis = (vis === 'none' || vis === undefined) ? 'visible' : 'none';
    this.map.setLayoutProperty(id, 'visibility', nextVis);
  }

  ngOnDestroy() { if (this.map) this.map.remove(); }
}