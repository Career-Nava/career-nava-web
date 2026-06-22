import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { faArrowUpRightFromSquare, faEye, faPen } from '@fortawesome/free-solid-svg-icons';
import { Session } from '../../../services/session/session.model';
import { SessionService } from '../../../services/session/session.service';
import { SharedModule } from '../../../shared/shared.module';

type SessionViewFilter = 'all' | 'today' | 'upcoming' | 'completed' | 'pending';

@Component({
  selector: 'app-admin-sessions',
  standalone: true,
  imports: [ DatePipe, NgClass, NgForOf, NgIf, SharedModule ],
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.scss'
})
export class AdminSessionsComponent implements OnInit {
  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  protected readonly faEye = faEye;
  protected readonly faPen = faPen;

  sessions: Session[] = [];
  loading = true;
  error: string | null = null;

  searchQuery = '';
  viewFilter: SessionViewFilter = 'all';

  constructor(private sessionService: SessionService) {
  }

  ngOnInit(): void {
    this.sessionService.getAdminSessions().subscribe({
      next: sessions => {
        this.sessions = sessions;
        this.error = null;
        this.loading = false;
      },
      error: err => {
        this.sessions = [];
        this.error = this.getSessionLoadError(err);
        this.loading = false;
      }
    });
  }

  get filteredSessions(): Session[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.sessions.filter(session => {
      const matchesView = this.matchesView(session);
      if (!matchesView) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        session.title,
        session.mentorName,
        session.mentorEmail,
        session.menteeName,
        session.menteeEmail,
        session.status
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }

  get totalSessions(): number {
    return this.sessions.length;
  }

  get todayCount(): number {
    return this.sessions.filter(session => this.getTimingBucket(session) === 'today').length;
  }

  get upcomingCount(): number {
    return this.sessions.filter(session => this.getTimingBucket(session) === 'upcoming').length;
  }

  get completedCount(): number {
    return this.sessions.filter(session => this.getTimingBucket(session) === 'completed').length;
  }

  get pendingCount(): number {
    return this.sessions.filter(session => (session.status || '').toLowerCase() === 'pending').length;
  }

  get filteredCount(): number {
    return this.filteredSessions.length;
  }

  formatDuration(minutes: number): string {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${ minutes } min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${ hrs }h` : `${ hrs }h ${ mins }m`;
  }

  onSearch(value: string): void {
    this.searchQuery = value;
  }

  onViewChange(value: string): void {
    this.viewFilter = value as SessionViewFilter;
  }

  trackSession(_: number, session: Session): number {
    return session.sessionId;
  }

  getStatusBadgeClass(session: Session): string {
    const status = (session.status || '').toLowerCase();

    if (status === 'pending') {
      return 'admin-badge--warning';
    }

    if (status === 'approved' || status === 'confirmed' || status === 'paid' || status === 'active') {
      return 'admin-badge--success';
    }

    if (status === 'cancelled' || status === 'canceled') {
      return 'admin-badge--danger';
    }

    if (this.getTimingBucket(session) === 'completed') {
      return 'admin-badge--muted';
    }

    return 'admin-badge--info';
  }

  getEmptyTitle(): string {
    return this.searchQuery || this.viewFilter !== 'all' ? 'No sessions match the current filters' : 'No sessions found';
  }

  getEmptyMessage(): string {
    if (this.searchQuery || this.viewFilter !== 'all') {
      return 'Try a broader search or switch back to all session windows to review more platform activity.';
    }

    return 'Platform sessions will appear here after mentees book time with mentors.';
  }

  private matchesView(session: Session): boolean {
    switch (this.viewFilter) {
      case 'today':
        return this.getTimingBucket(session) === 'today';
      case 'upcoming':
        return this.getTimingBucket(session) === 'upcoming';
      case 'completed':
        return this.getTimingBucket(session) === 'completed';
      case 'pending':
        return (session.status || '').toLowerCase() === 'pending';
      default:
        return true;
    }
  }

  private getTimingBucket(session: Session): 'today' | 'upcoming' | 'completed' | 'unscheduled' {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (session.calendlyStartAt) {
      const startAt = new Date(session.calendlyStartAt);

      if (startAt >= startOfToday && startAt <= endOfToday) {
        return 'today';
      }

      if (startAt > endOfToday) {
        return 'upcoming';
      }
    }

    if (session.calendlyEndAt && new Date(session.calendlyEndAt) < startOfToday) {
      return 'completed';
    }

    return 'unscheduled';
  }

  private getSessionLoadError(err: any): string {
    if (err?.status === 401) {
      return 'Please sign in again to view admin sessions.';
    }

    if (err?.status === 403) {
      return 'Only admins can view all platform sessions.';
    }

    return 'Unable to load platform sessions right now. Please try again later.';
  }
}
