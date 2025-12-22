import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";
import { ConfigurationService } from "./configuration.service";
import { RestService } from "./rest.service";

@Injectable({
  providedIn: 'root'
})
export class PingService extends RestService {
  private readonly STORAGE_KEY = 'lastApiPing';
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  constructor(http: HttpClient, config: ConfigurationService) {
    super(http, 'Health', config.get<any>('api').baseUrl);
  }

  // Pings the base API URL to wake backend if needed (only in production)
  pingServer(): void {
    if (!environment.production) {
      console.log('⏹ Not in production, skipping API ping');
      return;
    }

    const lastPing = localStorage.getItem(this.STORAGE_KEY);
    const now = Date.now();

    // Skip ping if done within TTL
    if (lastPing && now - +lastPing < this.CACHE_TTL) return;

    // Ping base API (no resource path)
    this.http.get(this.baseUrl, { responseType: 'text' }).subscribe({
        next: () => {
          console.log('✅ API ping successful');
          localStorage.setItem(this.STORAGE_KEY, now.toString());
        },
        error: (err) => console.warn('⚠️ API ping failed:', err)
      }
    );
  }
}
