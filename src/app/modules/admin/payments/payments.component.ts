import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { faEye, faFilter, faRotateRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import { debounceTime, Subscription } from 'rxjs';
import { AdminPayment, AdminPaymentFilters } from '../../../services/payment/payment.model';
import { PaymentService } from '../../../services/payment/payment.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [ DatePipe, NgClass, NgForOf, NgIf, SharedModule ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class AdminPaymentsComponent implements OnInit, OnDestroy {
  protected readonly faEye = faEye;
  protected readonly faFilter = faFilter;
  protected readonly faRotateRight = faRotateRight;
  protected readonly faXmark = faXmark;

  payments: AdminPayment[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';
  filtersExpanded = false;

  filterForm: FormGroup = this.fb.group({
    status: [ '' ],
    provider: [ '' ],
    dateFrom: [ '' ],
    dateTo: [ '' ],
    amountMin: [ '' ],
    amountMax: [ '' ],
    internalReference: [ '' ],
    providerReference: [ '' ]
  });

  private readonly subs = new Subscription();

  constructor(private paymentService: PaymentService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadPayments();
    this.subs.add(this.filterForm.valueChanges.pipe(debounceTime(200)).subscribe(() => this.loadPayments()));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadPayments(): void {
    this.loading = true;
    this.paymentService.getAdminPayments(this.buildFilters()).subscribe({
      next: payments => { this.payments = payments; this.error = null; this.loading = false; },
      error: err => { this.payments = []; this.error = this.getLoadError(err); this.loading = false; }
    });
  }

  get filteredPayments(): AdminPayment[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return this.payments;

    return this.payments.filter(payment => [
      payment.internalReference,
      payment.providerReference,
      payment.status,
      payment.provider,
      payment.mentee?.fullName,
      payment.mentee?.email,
      payment.mentor?.fullName,
      payment.mentor?.email,
      payment.session?.eventTypeName
    ].filter(Boolean).join(' ').toLowerCase().includes(query));
  }

  get totalPayments(): number { return this.payments.length; }
  get filteredCount(): number { return this.filteredPayments.length; }
  get paidCount(): number { return this.payments.filter(payment => this.normalize(payment.status) === 'paid').length; }
  get failedCount(): number { return this.payments.filter(payment => this.normalize(payment.status) === 'failed').length; }
  get pendingCount(): number { return this.payments.filter(payment => [ 'pending', 'processing' ].includes(this.normalize(payment.status))).length; }
  get showClearFilters(): boolean {
    const filters = this.filterForm.value;
    return this.filtersExpanded || !!this.searchQuery.trim() || Object.values(filters).some(value => !!value);
  }

  onSearch(value: string): void { this.searchQuery = value; }
  toggleFilters(): void { this.filtersExpanded = !this.filtersExpanded; }
  trackPayment(_: number, payment: AdminPayment): number { return payment.paymentId; }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterForm.reset({
      status: '',
      provider: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      internalReference: '',
      providerReference: ''
    });
  }

  formatMoney(payment: AdminPayment): string {
    const amount = typeof payment.amount === 'number' ? payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
    return `${ amount } ${ payment.currency || '' }`.trim();
  }

  getParticipantLabel(payment: AdminPayment): string {
    return payment.mentee?.fullName || payment.mentee?.email || 'Mentee unavailable';
  }

  getMentorLabel(payment: AdminPayment): string {
    return payment.mentor?.fullName || payment.mentor?.email || 'Mentor unavailable';
  }

  getPaymentReference(payment: AdminPayment): string {
    return payment.internalReference || payment.providerReference || 'Payment reference unavailable';
  }

  getSessionContext(payment: AdminPayment): string {
    return payment.session?.eventTypeName
      || (payment.session?.calendlyStartAt ? new Date(payment.session.calendlyStartAt).toLocaleString() : '')
      || 'Session context unavailable';
  }

  getStatusBadgeClass(status?: string | null): string {
    const normalized = this.normalize(status);
    if (normalized === 'paid') return 'admin-badge--success';
    if (normalized === 'failed' || normalized === 'cancelled') return 'admin-badge--danger';
    if (normalized === 'pending' || normalized === 'processing') return 'admin-badge--warning';
    return 'admin-badge--info';
  }

  getEmptyTitle(): string { return this.showClearFilters ? 'No payments match the current filters' : 'No payment records found'; }
  getEmptyMessage(): string { return this.showClearFilters ? 'Try broader filters or clear the current search.' : 'Payment records will appear here after checkout activity starts.'; }

  private buildFilters(): AdminPaymentFilters {
    const value = this.filterForm.value;
    return {
      status: value.status || undefined,
      provider: value.provider || undefined,
      dateFrom: value.dateFrom || null,
      dateTo: value.dateTo || null,
      amountMin: this.toNumber(value.amountMin),
      amountMax: this.toNumber(value.amountMax),
      internalReference: value.internalReference || null,
      providerReference: value.providerReference || null
    };
  }

  private toNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private normalize(value?: string | null): string {
    return (value || '').toLowerCase();
  }

  private getLoadError(err: any): string {
    if (err?.status === 401) return 'Please sign in again to view admin payments.';
    if (err?.status === 403) return 'Only admins can view payment audit records.';
    return 'Unable to load payment records right now. Please try again later.';
  }
}
