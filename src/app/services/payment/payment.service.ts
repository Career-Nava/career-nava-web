import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../api-response';
import { ConfigurationService } from '../configuration.service';
import { RestService } from '../rest.service';
import {
  AdminPayment,
  AdminPaymentDetail,
  AdminPaymentEvent,
  AdminPaymentEventDetail,
  AdminPaymentEventFilters,
  AdminPaymentFilters,
  PaymentInitializationResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse
} from './payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService extends RestService {
  constructor(http: HttpClient, config: ConfigurationService) {
    super(http, 'Payment', config.get<any>('api').baseUrl);
  }

  initializeSessionPayment(sessionId: number): Observable<PaymentInitializationResponse> {
    return this.http
      .post<ApiResponse<PaymentInitializationResponse>>(`${ this.baseUrl }/Sessions/${ sessionId }/Initialize`, {})
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  verifyPayment(request: PaymentVerificationRequest): Observable<PaymentVerificationResponse> {
    return this.http
      .post<ApiResponse<PaymentVerificationResponse>>(`${ this.baseUrl }/Verify`, request)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  getAdminPayments(filters?: AdminPaymentFilters): Observable<AdminPayment[]> {
    return this.http
      .get<ApiResponse<AdminPayment[]>>(`${ this.baseUrl }/Admin`, { params: this.toAdminPaymentParams(filters) })
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  getAdminPaymentById(paymentId: number): Observable<AdminPaymentDetail> {
    return this.http
      .get<ApiResponse<AdminPaymentDetail>>(`${ this.baseUrl }/Admin/${ paymentId }`)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  getAdminPaymentEvents(filters?: AdminPaymentEventFilters): Observable<AdminPaymentEvent[]> {
    return this.http
      .get<ApiResponse<AdminPaymentEvent[]>>(`${ this.baseUrl }/Admin/Events`, { params: this.toAdminPaymentEventParams(filters) })
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  getAdminPaymentEventsByPaymentId(paymentId: number): Observable<AdminPaymentEvent[]> {
    return this.http
      .get<ApiResponse<AdminPaymentEvent[]>>(`${ this.baseUrl }/Admin/${ paymentId }/Events`)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  getAdminPaymentEventById(paymentEventId: number): Observable<AdminPaymentEventDetail> {
    return this.http
      .get<ApiResponse<AdminPaymentEventDetail>>(`${ this.baseUrl }/Admin/Events/${ paymentEventId }`)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  private toAdminPaymentParams(filters?: AdminPaymentFilters): Record<string, string> {
    const params: Record<string, string> = {};
    if (!filters) return params;

    if (filters.status) params['status'] = filters.status;
    if (filters.provider) params['provider'] = filters.provider;
    if (filters.sessionId !== null && filters.sessionId !== undefined) params['sessionId'] = String(filters.sessionId);
    if (filters.menteeId !== null && filters.menteeId !== undefined) params['menteeId'] = String(filters.menteeId);
    if (filters.mentorProfileId !== null && filters.mentorProfileId !== undefined) params['mentorProfileId'] = String(filters.mentorProfileId);
    if (filters.dateFrom) params['dateFrom'] = filters.dateFrom;
    if (filters.dateTo) params['dateTo'] = filters.dateTo;
    if (filters.amountMin !== null && filters.amountMin !== undefined) params['amountMin'] = String(filters.amountMin);
    if (filters.amountMax !== null && filters.amountMax !== undefined) params['amountMax'] = String(filters.amountMax);
    if (filters.internalReference) params['internalReference'] = filters.internalReference;
    if (filters.providerReference) params['providerReference'] = filters.providerReference;

    return params;
  }

  private toAdminPaymentEventParams(filters?: AdminPaymentEventFilters): Record<string, string> {
    const params: Record<string, string> = {};
    if (!filters) return params;

    if (filters.paymentId !== null && filters.paymentId !== undefined) params['paymentId'] = String(filters.paymentId);
    if (filters.provider) params['provider'] = filters.provider;
    if (filters.providerEvent) params['providerEvent'] = filters.providerEvent;
    if (filters.eventStatus) params['eventStatus'] = filters.eventStatus;
    if (filters.dateFrom) params['dateFrom'] = filters.dateFrom;
    if (filters.dateTo) params['dateTo'] = filters.dateTo;
    if (filters.internalReference) params['internalReference'] = filters.internalReference;
    if (filters.providerReference) params['providerReference'] = filters.providerReference;

    return params;
  }
}
