import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // ✅ Required for API calls
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // ✅ Helps with UI rendering

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(), // ✅ Essential for Check-in 3
    provideAnimationsAsync()
  ]
};