import { DatePipe, NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faArrowLeft, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { AdminPaymentEventDetail } from '../../../services/payment/payment.model';
import { PaymentService } from '../../../services/payment/payment.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-admin-payment-event-detail',
  standalone: true,
  imports: [ DatePipe, NgClass, NgIf, SharedModule ],
  templateUrl: './payment-event-detail.component.html',
  styleUrl: './payment-event-detail.component.scss'
})
export class AdminPaymentEventDetailComponent implements OnInit {
  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faRotateRight = faRotateRight;

  event: AdminPaymentEventDetail | null = null;
  loading = true;
  error: string | null = null;
  private paymentEventId = 0;

  constructor(private route: ActivatedRoute, private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.paymentEventId = Number(this.route.snapshot.paramMap.get('paymentEventId'));
    this.loadEvent();
  }

  loadEvent(): void {
    if (!this.paymentEventId) {
      this.error = 'The payment event route is missing or invalid.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.paymentService.getAdminPaymentEventById(this.paymentEventId).subscribe({
      next: event => { this.event = event; this.error = null; this.loading = false; },
      error: err => { this.event = null; this.error = this.getLoadError(err); this.loading = false; }
    });
  }

  getStatusBadgeClass(status?: string | null): string {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'processed' || normalized === 'handled') return 'admin-badge--success';
    if (normalized === 'failed' || normalized === 'error') return 'admin-badge--danger';
    if (normalized === 'received' || normalized === 'pending') return 'admin-badge--warning';
    return 'admin-badge--info';
  }

  getPaymentReference(event: AdminPaymentEventDetail): string {
    return event.paymentInternalReference
      || event.paymentProviderReference
      || event.providerReference
      || 'Payment reference unavailable';
  }

  private getLoadError(err: any): string {
    if (err?.status === 401) return 'Please sign in again to view this payment event.';
    if (err?.status === 403) return 'Only admins can view payment event detail.';
    if (err?.status === 404) return 'Payment event record was not found.';
    return 'Unable to load this payment event right now.';
  }
}
