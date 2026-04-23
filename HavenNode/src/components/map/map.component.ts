import { Component, AfterViewInit, ElementRef, ViewChild, Input, OnDestroy, NgZone, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-wrapper w-100 h-100 position-relative bg-dark">
      <div #mapContainer class="map-container"></div>
      
      <!-- Reactive Loader using the isReady Signal -->
      @if (!isReady()) {
        <div class="loader position-absolute inset-0 d-flex flex-column align-items-center justify-content-center bg-black text-info">
          <div class="spinner-border mb-3" role="status"></div>
          <span class="small tracking-widest fw-bold text-uppercase">Geospatial Engine Booting...</span>
          <div class="x-small mt-2 opacity-50">{{ statusMessage() }}</div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; min-height: 400px; }
    .map-wrapper { overflow: hidden; width: 100%; height: 100%; background: #0a0a0a; }
    .map-container { position: absolute; inset: 0; width: 100%; height: 100%; }
    .loader { z-index: 100; transition: all 0.5s ease; }
    .tracking-widest { letter-spacing: 0.3em; }
    .x-small { font-size: 0.65rem; }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() center: [number, number] = [120.5828, 16.4550];
  
  /**
   * REACTIVE STATE SIGNALS
   * We use Signals for fine-grained reactivity. 
   * Access these as functions: isReady()
   */
  public isReady = signal<boolean>(false);
  public statusMessage = signal<string>('Loading core modules...');
  public map: any;

  constructor(private zone: NgZone) {}

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => this.initMap());
  }

  private async initMap() {
    const win = window as any;
    
    try {
      if (!win.maplibregl) {
        this.statusMessage.set('Fetching MapLibre Engine...');
        await this.loadScripts();
      }

      this.statusMessage.set('Connecting to OpenFreeMap styles...');
      
      this.map = new win.maplibregl.Map({
        container: this.mapContainer.nativeElement,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: this.center,
        zoom: 13,
        pitch: 45,
        fadeDuration: 0
      });

      this.map.on('load', () => {
        this.zone.run(() => {
          this.isReady.set(true);
          this.statusMessage.set('System Operational');
          setTimeout(() => this.map.resize(), 100);
        });
      });

      this.map.on('error', (e: any) => {
        console.error('Map Engine Error:', e);
        this.zone.run(() => {
          this.statusMessage.set('Sync Error: Re-attempting...');
        });
      });

    } catch (err) {
      console.error('Map Init Failure:', err);
      this.zone.run(() => this.statusMessage.set('Hardware Acceleration Failed'));
    }
  }

  private loadScripts(): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
      document.head.appendChild(link);
      
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }

  public getFirstLabelId(): string {
    if (!this.map) return '';
    const style = this.map.getStyle();
    if (!style || !style.layers) return '';
    for (const layer of style.layers) {
      if (layer.type === 'symbol') return layer.id;
    }
    return '';
  }

  ngOnDestroy() { 
    if (this.map) this.map.remove(); 
  }
}