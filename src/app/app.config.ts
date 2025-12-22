import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Material from '@primeuix/themes/material';
import {
  provideTanStackQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';

import { routes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import EmeraldGreenPreset from './app.preset';
import { authInterceptor } from './core/interceptors/interceptor.interceptor';

import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireModule } from '@angular/fire/compat';


const firebaseConfig = {
  apiKey: import.meta.env.NG_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.NG_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.NG_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.NG_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.NG_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.NG_APP_FIREBASE_APP_ID,
};

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      AngularFireModule.initializeApp(firebaseConfig),
      AngularFirestoreModule
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
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
