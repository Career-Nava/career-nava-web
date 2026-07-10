import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faArrowLeft, faEye, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { AdminPaymentDetail, AdminPaymentEvent } from '../../../services/payment/payment.model';
import { PaymentService } from '../../../services/payment/payment.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-admin-payment-detail',
  standalone: true,
  imports: [ DatePipe, NgClass, NgForOf, NgIf, SharedModule ],
  templateUrl: './payment-detail.component.html',
  styleUrl: './payment-detail.component.scss'
})
export class AdminPaymentDetailComponent implements OnInit {
  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faEye = faEye;
  protected readonly faRotateRight = faRotateRight;

  payment: AdminPaymentDetail | null = null;
  events: AdminPaymentEvent[] = [];
  loading = true;
  eventsLoading = false;
  error: string | null = null;
  eventsError: string | null = null;
  private paymentId = 0;

  constructor(private route: ActivatedRoute, private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.paymentId = Number(this.route.snapshot.paramMap.get('paymentId'));
    this.loadPayment();
  }

  loadPayment(): void {
    if (!this.paymentId) {
      this.error = 'The payment route is missing or invalid.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.paymentService.getAdminPaymentById(this.paymentId).subscribe({
      next: payment => {
        this.payment = payment;
        this.error = null;
        this.loading = false;
        this.loadEvents();
      },
      error: err => { this.payment = null; this.error = this.getLoadError(err); this.loading = false; }
    });
  }

  loadEvents(): void {
    if (!this.paymentId) return;
    this.eventsLoading = true;
    this.paymentService.getAdminPaymentEventsByPaymentId(this.paymentId).subscribe({
      next: events => { this.events = events; this.eventsError = null; this.eventsLoading = false; },
      error: err => { this.events = []; this.eventsError = this.getEventsError(err); this.eventsLoading = false; }
    });
  }

  trackEvent(_: number, event: AdminPaymentEvent): number { return event.paymentEventId; }

  formatMoney(payment: AdminPaymentDetail): string {
    const amount = typeof payment.amount === 'number' ? payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
    return `${ amount } ${ payment.currency || '' }`.trim();
  }

  getMenteeLabel(payment: AdminPaymentDetail): string {
    return payment.mentee?.fullName || payment.mentee?.email || 'Mentee unavailable';
  }

  getMentorLabel(payment: AdminPaymentDetail): string {
    return payment.mentor?.fullName || payment.mentor?.email || 'Mentor unavailable';
  }

  getPaymentReference(payment: AdminPaymentDetail): string {
    return payment.internalReference || payment.providerReference || 'Payment reference unavailable';
  }

  getSessionLabel(payment: AdminPaymentDetail): string {
    return payment.session?.eventTypeName || 'Session context unavailable';
  }

  getPaymentStatusBadgeClass(status?: string | null): string {
    const normalized = this.normalize(status);
    if (normalized === 'paid') return 'admin-badge--success';
    if (normalized === 'failed' || normalized === 'cancelled') return 'admin-badge--danger';
    if (normalized === 'pending' || normalized === 'processing') return 'admin-badge--warning';
    return 'admin-badge--info';
  }

  getEventStatusBadgeClass(status?: string | null): string {
    const normalized = this.normalize(status);
    if (normalized === 'processed' || normalized === 'handled') return 'admin-badge--success';
    if (normalized === 'failed' || normalized === 'error') return 'admin-badge--danger';
    if (normalized === 'received' || normalized === 'pending') return 'admin-badge--warning';
    return 'admin-badge--info';
  }

  private normalize(value?: string | null): string {
    return (value || '').toLowerCase();
  }

  private getLoadError(err: any): string {
    if (err?.status === 401) return 'Please sign in again to view this payment.';
    if (err?.status === 403) return 'Only admins can view payment detail.';
    if (err?.status === 404) return 'Payment record was not found.';
    return 'Unable to load this payment right now.';
  }

  private getEventsError(err: any): string {
    if (err?.status === 401) return 'Please sign in again to view payment events.';
    if (err?.status === 403) return 'Only admins can view payment events.';
    return 'Unable to load events for this payment.';
  }
}
