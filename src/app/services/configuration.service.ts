import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private config = {
    api: {
      baseUrl: environment.apiBaseUrl
    }
  };

  get<T>(key: keyof typeof this.config): T {
    return this.config[key] as T;
  }
}
