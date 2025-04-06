import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { provideClientHydration } from '@angular/platform-browser';
export function tokenGetter() {
  return localStorage.getItem('token');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    provideClientHydration(), 

    // Gráficos dinámicos (Charts)
    provideCharts(withDefaultRegisterables()),

    // Cliente HTTP con interceptores (JWT incluido)
    provideHttpClient(withInterceptorsFromDi(), withFetch()),

    provideAnimationsAsync(),

    // JWT (autenticación)
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: ['localhost:8080'], // Cambia al dominio de tu backend actual
          disallowedRoutes: ['localhost:8080/login/forget'], // Rutas públicas sin JWT
        },
      })
    ),
  ],
};
