import { Component, AfterViewInit, ElementRef, ViewChild, Input, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-wrapper w-100 h-100 position-relative bg-light">
      <div #mapContainer class="map-container"></div>
      @if (!isReady) {
        <div class="loader position-absolute inset-0 d-flex flex-column align-items-center justify-content-center bg-white opacity-75">
          <div class="spinner-border text-primary mb-2"></div>
          <span class="small text-muted fw-bold">SYNCHRONIZING TILES...</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .map-container { position: absolute; inset: 0; }
    .inset-0 { top: 0; left: 0; right: 0; bottom: 0; }
    .loader { z-index: 20; }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Input() center: [number, number] = [120.5828, 16.4550];
  
  // FIX: These must be public to be accessed by Hazard Components
  public map: any;
  public isReady = false;

  constructor(private zone: NgZone, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => this.initMap());
  }

  private async initMap() {
    const win = window as any;
    if (!win.maplibregl) {
      await this.loadScripts();
    }

    this.map = new win.maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: this.center,
      zoom: 13,
      pitch: 45
    });

    this.map.on('load', () => {
      this.zone.run(() => {
        this.isReady = true;
        this.cdr.detectChanges();
        // Force a resize check to prevent white-space issues
        setTimeout(() => this.map.resize(), 100);
      });
    });
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

  /**
   * FIX: Added public helper to find the first label layer 
   * so weather overlays can be tucked beneath them.
   */
  public getFirstLabelId(): string {
    if (!this.map) return '';
    const layers = this.map.getStyle().layers;
    for (const layer of layers) {
      if (layer.type === 'symbol') return layer.id;
    }
    return '';
  }

  /**
   * FIX: Generic toggle for dashboard-level controls
   */
  public toggleLayer(id: string) {
    if (!this.map || !this.map.getLayer(id)) return;
    const vis = this.map.getLayoutProperty(id, 'visibility');
    this.map.setLayoutProperty(id, 'visibility', (vis === 'none' || vis === undefined) ? 'visible' : 'none');
  }

  ngOnDestroy() { if (this.map) this.map.remove(); }
}