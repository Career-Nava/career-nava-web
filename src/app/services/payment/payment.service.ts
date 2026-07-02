import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../api-response';
import { ConfigurationService } from '../configuration.service';
import { RestService } from '../rest.service';
import { PaymentInitializationResponse, PaymentVerificationRequest, PaymentVerificationResponse } from './payment.model';

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
}
