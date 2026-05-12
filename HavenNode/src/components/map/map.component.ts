import { Component, AfterViewInit, ElementRef, ViewChild, Input, OnDestroy, NgZone, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container position-relative w-100 h-100">
      <div #mapContainer class="w-100 h-100"></div>

      @if (!isReady()) {
        <div class="loader position-absolute inset-0 d-flex flex-column align-items-center justify-content-center bg-black" style="z-index: 1000;">
          <div class="spinner-border text-info mb-3"></div>
          <span class="small fw-bold tracking-widest text-uppercase text-info">Booting Map Engine...</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .map-container { overflow: hidden; background: #212529; }
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
      zoom: 10,
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

  // --- WIND VECTOR GEOJSON ARCHITECTURE ---

  private buildWindGeoJSON(uFlat: Float32Array, vFlat: Float32Array, gridSize: number, bounds: [[number, number], [number, number]]) {
    const features: any[] = [];
    const step = 2; // Skip cells to prevent arrow overcrowding

    for (let y = 0; y < gridSize; y += step) {
      for (let x = 0; x < gridSize; x += step) {
        const index = y * gridSize + x;
        const uVal = uFlat[index];
        const vVal = vFlat[index];

        const speed = Math.sqrt(uVal * uVal + vVal * vVal);
        
        // Convert to degrees for MapLibre rotation
        const direction = Math.atan2(vVal, uVal) * (180 / Math.PI);

        const lon = bounds[0][0] + (x / gridSize) * (bounds[1][0] - bounds[0][0]);
        const lat = bounds[0][1] + (y / gridSize) * (bounds[1][1] - bounds[0][1]);

        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lon, lat] },
          properties: { speed, direction }
        });
      }
    }

    return { type: 'FeatureCollection', features };
  }

  public renderWindArrows(uFlat: Float32Array, vFlat: Float32Array, gridSize: number, bounds: [[number, number], [number, number]]) {
    if (!this.map) return;
    this.clearHazardLayers();

    const geojson = this.buildWindGeoJSON(uFlat, vFlat, gridSize, bounds);
    const beforeId = this.getLabelLayerId();

    const addLayer = () => {
      this.map.addSource('wind-arrows-src', {
        type: 'geojson',
        data: geojson
      });

      this.map.addLayer({
        id: 'wind-arrows',
        type: 'symbol',
        source: 'wind-arrows-src',
        layout: {
          'icon-image': 'wind-arrow',
          'icon-size': 0.04, 
          'icon-rotate': ['get', 'direction'],
          'icon-allow-overlap': true,
          'icon-rotation-alignment': 'map'
        },
        paint: {
          'icon-opacity': 0.9,
          // NOTE: icon-color requires an SDF image. If the PNG is standard, 
          // MapLibre uses this as a fallback but won't tint. 
          'icon-color': [
            'interpolate', ['linear'], ['get', 'speed'],
            0, '#00ffff',
            5, '#00ff00',
            10, '#ffff00',
            20, '#ff0000'
          ]
        }
      }, beforeId);
    };

    if (!this.map.hasImage('wind-arrow')) {
      this.map.loadImage(
        'https://cdn-icons-png.flaticon.com/512/545/545682.png',
        (err: any, image: any) => {
          if (err) {
            console.warn('Flaticon blocked the image request (CORS). Using native MapLibre text-arrow fallback.');
            this.addFallbackTextArrow(geojson, beforeId);
            return;
          }
          if (!this.map.hasImage('wind-arrow')) {
            this.map.addImage('wind-arrow', image);
          }
          addLayer();
        }
      );
    } else {
      addLayer();
    }
  }

  // Automatically executed if the external image URL fails to load
  private addFallbackTextArrow(geojson: any, beforeId: string | undefined) {
    this.map.addSource('wind-arrows-src', { type: 'geojson', data: geojson });
    this.map.addLayer({
      id: 'wind-arrows',
      type: 'symbol',
      source: 'wind-arrows-src',
      layout: {
        'text-field': '➤', // Standard arrow character
        'text-size': 15,
        // The ➤ character naturally points East (0°). 
        // We invert the rotation direction so it aligns properly with the mathematical angle.
        'text-rotate': ['-', ['get', 'direction']], 
        'text-allow-overlap': true,
        'text-rotation-alignment': 'map'
      },
      paint: {
        'text-color': [
          'interpolate', ['linear'], ['get', 'speed'],
          0, '#00ffff',
          5, '#00ff00',
          10, '#ffff00',
          20, '#ff0000'
        ],
        'text-opacity': 0.9,
        'text-halo-color': '#000000',
        'text-halo-width': 1
      }
    }, beforeId);
  }

  // --- PROJECT NOAH POLYGON LAYERS ---

  public addPolygonLayer(id: string, url: string, fillColor: string) {
    if (!this.map || !this.isReady()) return;
    this.clearHazardLayers(); // Wipe previous layers
    
    const sourceId = `${id}-src`;
    const beforeId = this.getLabelLayerId(); // Keeps city names on top of the flood water

    this.map.addSource(sourceId, {
      type: 'geojson',
      data: url
    });

    this.map.addLayer({
      id: id,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': fillColor,
        'fill-opacity': 0.6,
        'fill-outline-color': '#000000'
      }
    }, beforeId);
  }

  // --- RASTER & HEATMAP LAYERS ---

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
    const sourceId = `${id}-src`;
    const beforeId = this.getLabelLayerId();

    this.map.addSource(sourceId, { type: 'raster', tiles: [url], tileSize: 256, maxzoom: 12 });
    this.map.addLayer({
      id: id, type: 'raster', source: sourceId,
      paint: { 'raster-opacity': opacity, 'raster-fade-duration': 400 }
    }, beforeId);
  }

  public clearHazardLayers() {
    if (!this.map) return;
    
    // Added 'noah-layer' to the cleanup array
    const layers = ['temp-layer', 'wind-layer', 'radar-layer', 'temp-heat', 'wind-heat', 'wind-arrows', 'noah-layer'];
    layers.forEach(l => {
      if (this.map.getLayer(l)) this.map.removeLayer(l);
      if (this.map.getSource(`${l}-src`)) this.map.removeSource(`${l}-src`);
    });
  }

  private getLabelLayerId(): string | undefined {
    const layers = this.map.getStyle()?.layers;
    return layers?.find((l: any) => l.type === 'symbol')?.id;
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
    this.clearHazardLayers();
    if (this.map) this.map.remove(); 
  }
}