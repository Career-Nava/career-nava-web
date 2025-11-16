import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { catchError, map, Observable, throwError } from "rxjs";
import { ConfigurationService } from "../configuration.service";
import { RestService } from "../rest.service";
import { ApiResponse } from "./calendly.model";

@Injectable({
  providedIn: 'root'
})
export class CalendlyService extends RestService {

  constructor(http: HttpClient, config: ConfigurationService, private router: Router) {
    super(http, 'calendly', config.get<any>('api').baseUrl);
  }

  connectCalendly(mentorId: number): Observable<string> {
    return this.http.get(`${ this.baseUrl }/connect`, { params: { mentorId }, responseType: 'text' });
  }

  handleCallback(code: string, state: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${ this.baseUrl }/callback`, { params: { code, state } }).pipe(map(res => res.data), catchError(err => {
      console.error('Callback error:', err);
      return throwError(() => err);
    }));
  }

  refreshToken(mentorId: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${ this.baseUrl }/refresh`, mentorId).pipe(
      map(res => res.data),
      catchError(err => {
        console.error('Failed to refresh Calendly token:', err);
        return throwError(() => err);
      })
    );
  }

  getSchedulingLink(mentorId: number): Observable<string> {
    return this.http.get<ApiResponse<string>>(`${ this.baseUrl }/scheduling-link`, { params: { mentorId } }).pipe(
      map(res => {
        if (res?.data) return res.data;
        throw new Error('Invalid Calendly link response');
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }
}
