import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from "rxjs";
import { ApiResponse } from "../api-response";
import { ConfigurationService } from "../configuration.service";
import { RestService } from "../rest.service";
import {
  AdminCalendlyEventType,
  AdminCalendlyEventTypeAssignmentUpdate,
  AdminCalendlyEventTypeDetail,
  AdminCalendlyEventTypeFilters,
  AdminCalendlyEventTypePricingUpdate
} from "./calendly.model";

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

  getAdminEventTypes(filters?: AdminCalendlyEventTypeFilters): Observable<AdminCalendlyEventType[]> {
    return this.http
      .get<ApiResponse<AdminCalendlyEventType[]>>(`${ this.baseUrl }/Admin/EventTypes`, {
        params: this.buildParams(this.toAdminEventTypeParams(filters))
      })
      .pipe(
        map(res => res.data ?? []),
        catchError(err => throwError(() => err))
      );
  }

  getAdminEventTypeById(eventTypeId: number): Observable<AdminCalendlyEventTypeDetail> {
    return this.http
      .get<ApiResponse<AdminCalendlyEventTypeDetail>>(`${ this.baseUrl }/Admin/EventTypes/${ eventTypeId }`)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  updateAdminEventTypeAssignment(
    eventTypeId: number,
    payload: AdminCalendlyEventTypeAssignmentUpdate
  ): Observable<AdminCalendlyEventTypeDetail> {
    return this.http
      .patch<ApiResponse<AdminCalendlyEventTypeDetail>>(`${ this.baseUrl }/Admin/EventTypes/${ eventTypeId }/Assignment`, payload)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  updateAdminEventTypePricing(
    eventTypeId: number,
    payload: AdminCalendlyEventTypePricingUpdate
  ): Observable<AdminCalendlyEventTypeDetail> {
    return this.http
      .patch<ApiResponse<AdminCalendlyEventTypeDetail>>(`${ this.baseUrl }/Admin/EventTypes/${ eventTypeId }/Pricing`, payload)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  syncAdminEventTypes(): Observable<AdminCalendlyEventType[]> {
    return this.http
      .post<ApiResponse<AdminCalendlyEventType[]>>(`${ this.baseUrl }/sync-event-types`, {})
      .pipe(
        map(res => res.data ?? []),
        catchError(err => throwError(() => err))
      );
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

  private toAdminEventTypeParams(filters?: AdminCalendlyEventTypeFilters): Record<string, string> {
    const params: Record<string, string> = {};
    if (!filters) return params;

    if (filters.provider) params['provider'] = filters.provider;
    if (filters.assigned !== null && filters.assigned !== undefined) params['assigned'] = String(filters.assigned);
    if (filters.mentorProfileId !== null && filters.mentorProfileId !== undefined) params['mentorProfileId'] = String(filters.mentorProfileId);
    if (filters.activeStatus) params['activeStatus'] = filters.activeStatus;
    if (filters.isFreeSession !== null && filters.isFreeSession !== undefined) params['isFreeSession'] = String(filters.isFreeSession);
    if (filters.search) params['search'] = filters.search;

    return params;
  }
}
