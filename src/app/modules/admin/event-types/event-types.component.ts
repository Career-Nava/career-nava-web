import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { faCloudArrowDown, faEye, faFilter, faRotateRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import { debounceTime, finalize, Subscription } from 'rxjs';
import { AdminCalendlyEventType, AdminCalendlyEventTypeFilters } from '../../../services/calendly/calendly.model';
import { CalendlyService } from '../../../services/calendly/calendly.service';
import { AdminMentor } from '../../../services/mentor/mentor.model';
import { MentorService } from '../../../services/mentor/mentor.service';
import { ToastService } from '../../../services/toast.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-admin-event-types',
  standalone: true,
  imports: [ DatePipe, NgClass, NgForOf, NgIf, SharedModule ],
  templateUrl: './event-types.component.html',
  styleUrl: './event-types.component.scss'
})
export class AdminEventTypesComponent implements OnInit, OnDestroy {
  protected readonly faCloudArrowDown = faCloudArrowDown;
  protected readonly faEye = faEye;
  protected readonly faFilter = faFilter;
  protected readonly faRotateRight = faRotateRight;
  protected readonly faXmark = faXmark;

  eventTypes: AdminCalendlyEventType[] = [];
  mentors: AdminMentor[] = [];
  loading = true;
  mentorsLoading = false;
  syncing = false;
  error: string | null = null;
  mentorsError: string | null = null;
  actionError: string | null = null;
  filtersExpanded = false;

  filterForm: FormGroup = this.fb.group({
    search: [ '' ],
    provider: [ '' ],
    activeStatus: [ '' ],
    assigned: [ '' ],
    mentorProfileId: [ '' ],
    isFreeSession: [ '' ]
  });

  private readonly subs = new Subscription();

  constructor(
    private calendlyService: CalendlyService,
    private mentorService: MentorService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadMentors();
    this.loadEventTypes();
    this.subs.add(this.filterForm.valueChanges.pipe(debounceTime(200)).subscribe(() => this.loadEventTypes()));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadEventTypes(): void {
    this.loading = true;
    this.calendlyService.getAdminEventTypes(this.buildFilters()).subscribe({
      next: eventTypes => { this.eventTypes = eventTypes; this.error = null; this.loading = false; },
      error: err => { this.eventTypes = []; this.error = this.getLoadError(err); this.loading = false; }
    });
  }

  loadMentors(): void {
    this.mentorsLoading = true;
    this.mentorService.getAdminMentors()
      .pipe(finalize(() => this.mentorsLoading = false))
      .subscribe({
        next: mentors => {
          this.mentors = mentors.filter(mentor => this.isActiveMentor(mentor));
          this.mentorsError = null;
        },
        error: err => {
          this.mentors = [];
          this.mentorsError = this.getMentorLoadError(err);
        }
      });
  }

  syncEventTypes(): void {
    this.syncing = true;
    this.actionError = null;
    this.calendlyService.syncAdminEventTypes()
      .pipe(finalize(() => this.syncing = false))
      .subscribe({
        next: () => {
          this.toast.show('Calendly event types synced.', { classname: 'bg-success text-light', delay: 3500 });
          this.loadEventTypes();
        },
        error: err => this.actionError = this.getActionError(err, 'Unable to sync Calendly event types.')
      });
  }

  get totalEventTypes(): number { return this.eventTypes.length; }
  get assignedCount(): number { return this.eventTypes.filter(eventType => eventType.assigned).length; }
  get unassignedCount(): number { return this.eventTypes.filter(eventType => !eventType.assigned).length; }
  get paidCount(): number { return this.eventTypes.filter(eventType => !eventType.isFreeSession).length; }
  get showClearFilters(): boolean {
    const filters = this.filterForm.value;
    return this.filtersExpanded || Object.values(filters).some(value => value !== null && value !== undefined && value !== '');
  }

  toggleFilters(): void { this.filtersExpanded = !this.filtersExpanded; }
  trackEventType(_: number, eventType: AdminCalendlyEventType): number { return eventType.eventTypeId; }
  trackMentor(_: number, mentor: AdminMentor): number | string { return mentor.mentorProfileId ?? mentor.email ?? mentor.fullName ?? _; }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      provider: '',
      activeStatus: '',
      assigned: '',
      mentorProfileId: '',
      isFreeSession: ''
    });
  }

  formatPrice(eventType: AdminCalendlyEventType): string {
    if (eventType.isFreeSession) return 'Free';
    const amount = typeof eventType.priceAmount === 'number'
      ? eventType.priceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '-';
    return `${ amount } ${ eventType.priceCurrency || '' }`.trim();
  }

  formatDuration(eventType: AdminCalendlyEventType): string {
    return eventType.durationMinutes ? `${ eventType.durationMinutes } min` : '-';
  }

  getMentorLabel(eventType: AdminCalendlyEventType): string {
    return eventType.mentor?.fullName || eventType.mentor?.email || 'Unassigned';
  }

  getProviderStatusBadgeClass(status?: string | null): string {
    const normalized = this.normalize(status);
    if (normalized === 'active') return 'admin-badge--success';
    if (normalized === 'inactive') return 'admin-badge--muted';
    return 'admin-badge--info';
  }

  getAssignmentBadgeClass(eventType: AdminCalendlyEventType): string {
    return eventType.assigned ? 'admin-badge--success' : 'admin-badge--warning';
  }

  getPriceBadgeClass(eventType: AdminCalendlyEventType): string {
    return eventType.isFreeSession ? 'admin-badge--info' : 'admin-badge--success';
  }

  getEmptyTitle(): string { return this.showClearFilters ? 'No event types match the current filters' : 'No event types found'; }
  getEmptyMessage(): string { return this.showClearFilters ? 'Try broader filters or clear the current search.' : 'Calendly event types will appear here after they are synced from the backend.'; }

  private buildFilters(): AdminCalendlyEventTypeFilters {
    const value = this.filterForm.value;
    return {
      search: value.search || null,
      provider: value.provider || undefined,
      activeStatus: value.activeStatus || null,
      assigned: this.toNullableBoolean(value.assigned),
      mentorProfileId: this.toNumber(value.mentorProfileId),
      isFreeSession: this.toNullableBoolean(value.isFreeSession)
    };
  }

  private toNullableBoolean(value: unknown): boolean | null {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return null;
  }

  private toNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private isActiveMentor(mentor: AdminMentor): boolean {
    return mentor.isActive === true && (mentor.mentorProfileStatus || '').toLowerCase() === 'active' && !!mentor.mentorProfileId;
  }

  private normalize(value?: string | null): string {
    return (value || '').toLowerCase();
  }

  private getLoadError(err: any): string {
    if (err?.status === 401) return 'Please sign in again to view event types.';
    if (err?.status === 403) return 'Only admins can view event type records.';
    return err?.error?.message || 'Unable to load event types right now. Please try again later.';
  }

  private getMentorLoadError(err: any): string {
    if (err?.status === 401) return 'Please sign in again to load mentor options.';
    if (err?.status === 403) return 'Only admins can load mentor options.';
    return err?.error?.message || 'Unable to load active mentor options.';
  }

  private getActionError(err: any, fallback: string): string {
    return err?.error?.message || err?.message || fallback;
  }
}
