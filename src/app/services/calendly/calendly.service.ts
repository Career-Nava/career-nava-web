import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from "rxjs";
import { ApiResponse } from "../api-response";
import { ConfigurationService } from "../configuration.service";
import { RestService } from "../rest.service";

@Injectable({ providedIn: 'root' })
export class CalendlyService extends RestService {

  constructor(http: HttpClient, config: ConfigurationService) {
    super(http, 'calendly', config.get<any>('api').baseUrl);
  }

  // Build OAuth redirect URL (pure function)
  getConnectUrl(mentorId: number): string {
    const params = this.buildParams({ mentorId });
    return `${ this.baseUrl }/connect?${ params.toString() }`;
  }

  getSchedulingLink(mentorId: number): Observable<string> {
    return this.fetchLink('scheduling-link', mentorId);
  }

  getBookingLink(mentorId: number): Observable<string> {
    return this.fetchLink('booking-link', mentorId);
  }

  private fetchLink(
    endpoint: 'scheduling-link' | 'booking-link',
    mentorId: number
  ): Observable<string> {
    return this.http
      .get<ApiResponse<string>>(`${ this.baseUrl }/${ endpoint }`, {
        params: { mentorId }
      })
      .pipe(
        map(res => {
          if (!res?.data) {
            throw new Error(`Invalid Calendly ${ endpoint } response`);
          }
          return res.data;
        }),
        catchError(err => throwError(() => err))
      );
  }
}
