import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthInterceptor } from "./services/auth/auth.interceptor";
import { AuthService } from './services/auth/auth.service';

function initializeAuth(authService: AuthService): () => Promise<unknown> {
  return () => firstValueFrom(authService.initializeAuth());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: APP_INITIALIZER, useFactory: initializeAuth, deps: [ AuthService ], multi: true },
  ]
};
