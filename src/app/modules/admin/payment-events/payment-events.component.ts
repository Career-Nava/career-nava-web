import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { faEye, faFilter, faRotateRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import { debounceTime, Subscription } from 'rxjs';
import { AdminPaymentEvent, AdminPaymentEventFilters } from '../../../services/payment/payment.model';
import { PaymentService } from '../../../services/payment/payment.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-admin-payment-events',
  standalone: true,
  imports: [ DatePipe, NgClass, NgForOf, NgIf, SharedModule ],
  templateUrl: './payment-events.component.html',
  styleUrl: './payment-events.component.scss'
})
export class AdminPaymentEventsComponent implements OnInit, OnDestroy {
  protected readonly faEye = faEye;
  protected readonly faFilter = faFilter;
  protected readonly faRotateRight = faRotateRight;
  protected readonly faXmark = faXmark;
  protected readonly baseProviderEvents = [
    'charge.success',
    'invoice.create',
    'invoice.payment_failed',
    'subscription.create',
    'subscription.not_renew',
    'subscription.disable',
    'paymentrequest.pending',
    'paymentrequest.success',
    'bank.transfer.rejected'
  ];

  events: AdminPaymentEvent[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';
  filtersExpanded = false;

  filterForm: FormGroup = this.fb.group({
    provider: [ '' ],
    providerEvent: [ '' ],
    eventStatus: [ '' ],
    dateFrom: [ '' ],
    dateTo: [ '' ],
    internalReference: [ '' ],
    providerReference: [ '' ]
  });

  private readonly subs = new Subscription();

  constructor(private paymentService: PaymentService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadEvents();
    this.subs.add(this.filterForm.valueChanges.pipe(debounceTime(200)).subscribe(() => this.loadEvents()));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadEvents(): void {
    this.loading = true;
    this.paymentService.getAdminPaymentEvents(this.buildFilters()).subscribe({
      next: events => { this.events = events; this.error = null; this.loading = false; },
      error: err => { this.events = []; this.error = this.getLoadError(err); this.loading = false; }
    });
  }

  get filteredEvents(): AdminPaymentEvent[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return this.events;

    return this.events.filter(event => [
      event.provider,
      event.providerEvent,
      event.eventStatus,
      event.providerReference,
      event.paymentInternalReference,
      event.paymentProviderReference,
      event.menteeName,
      event.menteeEmail,
      event.processingError
    ].filter(Boolean).join(' ').toLowerCase().includes(query));
  }

  get totalEvents(): number { return this.events.length; }
  get filteredCount(): number { return this.filteredEvents.length; }
  get processedCount(): number { return this.events.filter(event => [ 'processed', 'handled' ].includes(this.normalize(event.eventStatus))).length; }
  get failedCount(): number { return this.events.filter(event => [ 'failed', 'error' ].includes(this.normalize(event.eventStatus))).length; }
  get pendingCount(): number { return this.events.filter(event => [ 'received', 'pending' ].includes(this.normalize(event.eventStatus))).length; }
  get providerEventOptions(): string[] {
    const values = new Set(this.baseProviderEvents);
    this.events
      .map(event => event.providerEvent?.trim())
      .filter((value): value is string => !!value)
      .forEach(value => values.add(value));

    return [
      ...this.baseProviderEvents,
      ...Array.from(values).filter(value => !this.baseProviderEvents.includes(value)).sort()
    ];
  }
  get showClearFilters(): boolean {
    const filters = this.filterForm.value;
    return this.filtersExpanded || !!this.searchQuery.trim() || Object.values(filters).some(value => !!value);
  }

  onSearch(value: string): void { this.searchQuery = value; }
  toggleFilters(): void { this.filtersExpanded = !this.filtersExpanded; }
  trackEvent(_: number, event: AdminPaymentEvent): number { return event.paymentEventId; }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterForm.reset({
      provider: '',
      providerEvent: '',
      eventStatus: '',
      dateFrom: '',
      dateTo: '',
      internalReference: '',
      providerReference: ''
    });
  }

  getStatusBadgeClass(status?: string | null): string {
    const normalized = this.normalize(status);
    if (normalized === 'processed' || normalized === 'handled') return 'admin-badge--success';
    if (normalized === 'failed' || normalized === 'error') return 'admin-badge--danger';
    if (normalized === 'received' || normalized === 'pending') return 'admin-badge--warning';
    return 'admin-badge--info';
  }

  getPaymentReference(event: AdminPaymentEvent): string {
    return event.paymentInternalReference
      || event.paymentProviderReference
      || event.providerReference
      || 'Payment reference unavailable';
  }

  getEmptyTitle(): string { return this.showClearFilters ? 'No events match the current filters' : 'No payment events found'; }
  getEmptyMessage(): string { return this.showClearFilters ? 'Try broader filters or clear the current search.' : 'Webhook and provider event audit records will appear here after payment activity starts.'; }

  private buildFilters(): AdminPaymentEventFilters {
    const value = this.filterForm.value;
    return {
      provider: value.provider || undefined,
      providerEvent: value.providerEvent || null,
      eventStatus: value.eventStatus || undefined,
      dateFrom: value.dateFrom || null,
      dateTo: value.dateTo || null,
      internalReference: value.internalReference || null,
      providerReference: value.providerReference || null
    };
  }

  private normalize(value?: string | null): string {
    return (value || '').toLowerCase();
  }

  private getLoadError(err: any): string {
    if (err?.status === 401) return 'Please sign in again to view payment events.';
    if (err?.status === 403) return 'Only admins can view payment event audit records.';
    return 'Unable to load payment events right now. Please try again later.';
  }
}
