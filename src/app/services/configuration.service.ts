import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private config = {
    api: {
      baseUrl: 'http://localhost:5128/api',
      googleClientId: '339583299127-9tk18mok2u08nlvkjblp6cg1ao1r24eq.apps.googleusercontent.com'
    }
  };

  get<T>(key: keyof typeof this.config): T {
    return this.config[key] as T;
  }
}
