import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { faArrowUpRightFromSquare, faFilter, faPen, faRotateRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import { debounceTime, finalize, Subscription } from 'rxjs';
import { AdminSession, AdminSessionDetail, AdminSessionFilters } from '../../../services/session/session.model';
import { SessionService } from '../../../services/session/session.service';
import { ToastService } from '../../../services/toast.service';
import { SharedModule } from '../../../shared/shared.module';

type SessionViewFilter = 'all' | 'today' | 'upcoming' | 'completed' | 'pending';

@Component({
  selector: 'app-admin-sessions',
  standalone: true,
  imports: [ DatePipe, NgClass, NgForOf, NgIf, SharedModule ],
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.scss'
})
export class AdminSessionsComponent implements OnInit, OnDestroy {
  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  protected readonly faFilter = faFilter;
  protected readonly faPen = faPen;
  protected readonly faRotateRight = faRotateRight;
  protected readonly faXmark = faXmark;

  sessions: AdminSession[] = [];
  selectedSession: AdminSessionDetail | null = null;
  loading = true;
  saving = false;
  error: string | null = null;
  actionError: string | null = null;
  actionMessage: string | null = null;

  searchQuery = '';
  viewFilter: SessionViewFilter = 'all';
  filtersExpanded = false;
  selectedStatus = 'pending';

  filterForm: FormGroup = this.fb.group({
    status: [ '' ],
    dateFrom: [ '' ],
    dateTo: [ '' ],
    paymentStatus: [ '' ]
  });
  private readonly subs = new Subscription();

  constructor(private sessionService: SessionService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadSessions();
    this.subs.add(this.filterForm.valueChanges.pipe(debounceTime(150)).subscribe(() => this.loadSessions()));
  }

  loadSessions(): void {
    this.loading = true;
    this.sessionService.getAdminSessions(this.buildFilters()).subscribe({
      next: sessions => { this.sessions = sessions; this.error = null; this.loading = false; },
      error: err => { this.sessions = []; this.error = this.getSessionLoadError(err); this.loading = false; }
    });
  }

  get filteredSessions(): AdminSession[] {
    const query = this.searchQuery.trim().toLowerCase();
    return this.sessions.filter(session => {
      if (!this.matchesView(session)) return false;
      if (!query) return true;
      return [ session.title, session.mentorName, session.mentorEmail, session.menteeName, session.menteeEmail, session.status, session.paymentStatus ].filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  }

  get totalSessions(): number { return this.sessions.length; }
  get todayCount(): number { return this.sessions.filter(session => this.getTimingBucket(session) === 'today').length; }
  get upcomingCount(): number { return this.sessions.filter(session => this.getTimingBucket(session) === 'upcoming').length; }
  get completedCount(): number { return this.sessions.filter(session => this.getTimingBucket(session) === 'completed').length; }
  get pendingCount(): number { return this.sessions.filter(session => (session.status || '').toLowerCase() === 'pending').length; }
  get filteredCount(): number { return this.filteredSessions.length; }

  formatDuration(minutes: number): string {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${ minutes } min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${ hrs }h` : `${ hrs }h ${ mins }m`;
  }

  onSearch(value: string): void { this.searchQuery = value; }
  onViewChange(value: string): void { this.viewFilter = value as SessionViewFilter; }
  toggleFilters(): void { this.filtersExpanded = !this.filtersExpanded; }
  trackSession(_: number, session: AdminSession): number { return session.sessionId; }

  clearFilters(): void {
    this.searchQuery = '';
    this.viewFilter = 'all';
    this.filterForm.reset({ status: '', dateFrom: '', dateTo: '', paymentStatus: '' });
  }

  viewSession(session: AdminSession): void {
    this.actionError = null;
    this.sessionService.getAdminSessionById(session.sessionId).subscribe({
      next: detail => {
        this.selectedSession = detail;
        this.selectedStatus = this.toAllowedDetailStatus(detail.status);
      },
      error: err => this.actionError = this.getActionError(err, 'Unable to load session detail.')
    });
  }

  updateSelectedStatus(status: string): void {
    if (!this.selectedSession) return;
    const normalized = this.toAllowedDetailStatus(status);
    const current = this.toAllowedDetailStatus(this.selectedSession.status);
    if (normalized === current) return;
    const action = normalized === 'completed' ? 'complete' : normalized === 'cancelled' ? 'cancel' : 'pending';
    this.updateStatus(this.selectedSession, action);
  }

  private updateStatus(session: AdminSession, action: 'complete' | 'cancel' | 'pending'): void {
    const text = action === 'pending' ? 'move this session back to pending' : `mark this session ${ action === 'complete' ? 'completed' : 'cancelled' }`;
    if (!confirm(`Are you sure you want to ${ text }? This does not mutate Calendly or payment state.`)) return;
    const request = action === 'complete'
      ? this.sessionService.completeAdminSession(session.sessionId)
      : action === 'cancel'
        ? this.sessionService.cancelAdminSession(session.sessionId)
        : this.sessionService.moveAdminSessionToPending(session.sessionId);
    this.saving = true;
    request.pipe(finalize(() => this.saving = false)).subscribe({
      next: updated => { this.selectedSession = updated; this.actionMessage = 'Session status updated.'; this.toast.show('Session status updated.', { classname: 'bg-success text-light', delay: 3500 }); this.loadSessions(); },
      error: err => this.actionError = this.getActionError(err, 'Unable to update session status.')
    });
  }

  closeDetail(): void { this.selectedSession = null; this.actionError = null; this.actionMessage = null; }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getStatusBadgeClass(session: AdminSession): string {
    const status = (session.status || '').toLowerCase();
    if (status === 'pending') return 'admin-badge--warning';
    if (status === 'booked') return 'admin-badge--success';
    if (status === 'cancelled' || status === 'declined') return 'admin-badge--danger';
    if (status === 'completed') return 'admin-badge--muted';
    return 'admin-badge--info';
  }

  getPaymentLabel(session: AdminSession): string {
    if (session.isFreeSession === true) return 'Free';
    return session.paymentStatus || 'Payment pending';
  }

  getEmptyTitle(): string { return this.searchQuery || this.viewFilter !== 'all' ? 'No sessions match the current filters' : 'No sessions found'; }
  getEmptyMessage(): string { return this.searchQuery || this.viewFilter !== 'all' ? 'Try broader filters or search terms.' : 'Platform sessions will appear here after Calendly bookings create them.'; }

  private matchesView(session: AdminSession): boolean {
    switch (this.viewFilter) {
      case 'today': return this.getTimingBucket(session) === 'today';
      case 'upcoming': return this.getTimingBucket(session) === 'upcoming';
      case 'completed': return (session.status || '').toLowerCase() === 'completed' || this.getTimingBucket(session) === 'completed';
      case 'pending': return (session.status || '').toLowerCase() === 'pending';
      default: return true;
    }
  }

  private getTimingBucket(session: AdminSession): 'today' | 'upcoming' | 'completed' | 'unscheduled' {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    if (session.calendlyStartAt) {
      const startAt = new Date(session.calendlyStartAt);
      if (startAt >= startOfToday && startAt <= endOfToday) return 'today';
      if (startAt > endOfToday) return 'upcoming';
    }
    if (session.calendlyEndAt && new Date(session.calendlyEndAt) < startOfToday) return 'completed';
    return 'unscheduled';
  }

  private buildFilters(): AdminSessionFilters {
    const value = this.filterForm.value;
    return {
      status: value.status || undefined,
      dateFrom: value.dateFrom || null,
      dateTo: value.dateTo || null,
      paymentStatus: value.paymentStatus || undefined
    };
  }

  private getSessionLoadError(err: any): string {
    if (err?.status === 401) return 'Please sign in again to view admin sessions.';
    if (err?.status === 403) return 'Only admins can view all platform sessions.';
    return 'Unable to load platform sessions right now. Please try again later.';
  }

  private getActionError(err: any, fallback: string): string { return err?.error?.message || err?.message || fallback; }

  private toAllowedDetailStatus(status?: string | null): 'pending' | 'completed' | 'cancelled' {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'completed') return 'completed';
    if (normalized === 'cancelled') return 'cancelled';
    return 'pending';
  }
}
