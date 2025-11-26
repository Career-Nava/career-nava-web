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

  // Returns the URL to redirect the user to Calendly OAuth
  getConnectUrl(mentorId: number): string {
    const params = this.buildParams({ mentorId });
    return `${ this.baseUrl }/connect?${ params.toString() }`;
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
