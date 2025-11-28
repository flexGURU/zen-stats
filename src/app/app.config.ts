import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Material from '@primeuix/themes/material';
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import EmeraldGreenPreset from './app.preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideTanStackQuery(new QueryClient()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: EmeraldGreenPreset,
        options: {
          darkModeSelector: '.my-app-dark',
        },
      },
    }),
  ],
};
