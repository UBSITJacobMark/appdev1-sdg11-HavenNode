import { Component, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../../../components/map/map.component';
import { WeatherService } from '../../../services/weather.service';

@Component({
  selector: 'app-precipitation-hazard',
  standalone: true,
  imports: [CommonModule, MapComponent],
  template: `
    <div class="hazard-page h-100 d-flex flex-column">
      <div class="info-bar p-2 bg-primary text-white small">
        LAYER: LIVE RAIN RADAR (PRECIPITATION)
      </div>
      <app-map class="flex-grow-1" #mapComp></app-map>
    </div>
  `
})
export class PrecipitationComponent implements AfterViewInit {
  @ViewChild('mapComp') mapComp!: MapComponent;
  private weather = inject(WeatherService);

  ngAfterViewInit() {
    const checkReady = setInterval(() => {
      if (this.mapComp.isReady) {
        this.addRadarLayer();
        clearInterval(checkReady);
      }
    }, 100);
  }

  private async addRadarLayer() {
    const map = this.mapComp.map;
    const labelId = this.mapComp.getFirstLabelId();
    const data = await this.weather.getRainViewerData();
    const path = data.radar.past[data.radar.past.length - 1].path;

    map.addSource('radar-src', {
      type: 'raster',
      tiles: [`https://tilecache.rainviewer.com${path}/256/{z}/{x}/{y}/2/1_1.png`],
      tileSize: 256
    });

    map.addLayer({
      id: 'radar-layer',
      type: 'raster',
      source: 'radar-src',
      paint: { 'raster-opacity': 0.8 }
    }, labelId);
  }
}