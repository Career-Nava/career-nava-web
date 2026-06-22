import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { SessionGroup, SessionGroupPanelComponent } from "../../shared/session-group-panel/session-group-panel.component";
import { Session } from "../../../services/session/session.model";
import { SessionService } from "../../../services/session/session.service";
import { SharedModule } from "../../../shared/shared.module";

@Component({
  selector: 'app-student-sessions',
  standalone: true,
  imports: [ FaIconComponent, SessionGroupPanelComponent, SharedModule ],
  templateUrl: './student-sessions.component.html',
  styleUrls: [ './student-sessions.component.scss' ]
})
export class StudentSessionsComponent implements OnInit, OnDestroy {

  faWarning = faExclamationTriangle;

  sessions: Session[] = [];
  activeSessionToJoin: Session | null = null;

  loading = true;
  error: string | null = null;

  // Payment modal state
  showPaymentModal = false;
  isLoadingPayment = false;

  showJoinConfirmModal = false;

  paymentUrl = 'https://paystack.shop/pay/careernava_scholarship_coaching';
  safePaymentUrl!: SafeResourceUrl;

  constructor(
    private sessionService: SessionService,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
    this.safePaymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.paymentUrl);

    this.sessionService.getMyMenteeSessions().subscribe({
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

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  get sessionGroups(): SessionGroup[] {
    return [
      {
        key: 'active',
        label: 'Today',
        sessions: this.filterSessions(this.sessions, 'active'),
        emptyTitle: 'No sessions today',
        emptyMessage: 'You have no sessions scheduled for today.'
      },
      {
        key: 'upcoming',
        label: 'Upcoming',
        sessions: this.filterSessions(this.sessions, 'upcoming'),
        emptyTitle: 'No upcoming sessions yet',
        emptyMessage: 'You have no upcoming sessions.'
      },
      {
        key: 'past',
        label: 'Completed',
        sessions: this.filterSessions(this.sessions, 'past'),
        emptyTitle: 'No completed sessions yet',
        emptyMessage: 'You have no completed sessions yet.'
      }
    ];
  }

  get heroSummary(): string {
    const upcomingCount = this.filterSessions(this.sessions, 'upcoming').length;

    if (upcomingCount > 0) {
      return `${ upcomingCount } upcoming session${ upcomingCount === 1 ? '' : 's' }`;
    }

    const totalCount = this.sessions.length;
    return `${ totalCount } total session${ totalCount === 1 ? '' : 's' }`;
  }

  isSessionActionDisabled = (session: Session): boolean => this.isPastSession(session);
  getSessionActionLabel = (): string => 'Join Session';

  private filterSessions(sessions: Session[], group: 'active' | 'upcoming' | 'past'): Session[] {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23, 59, 59, 999
    );

    switch (group) {
      case 'active':
        return sessions.filter(s =>
          s.calendlyStartAt &&
          new Date(s.calendlyStartAt) >= startOfToday &&
          new Date(s.calendlyStartAt) <= endOfToday
        );

      case 'upcoming':
        return sessions.filter(s =>
          s.calendlyStartAt &&
          new Date(s.calendlyStartAt) > endOfToday
        );

      case 'past':
        return sessions.filter(s =>
          s.calendlyEndAt &&
          new Date(s.calendlyEndAt) < startOfToday
        );

      default:
        return sessions;
    }
  }

  handleSessionClick(session: Session) {
    if (!session.meetingLink) {
      this.error = 'Meeting link not available yet.';
      return;
    }

    // Unpaid session → show confirmation modal
    if (session.status === 'pending') {
      this.activeSessionToJoin = session;
      this.showJoinConfirmModal = true;
      document.body.style.overflow = 'hidden';
      return;
    }

    // Paid or confirmed
    this.joinSession(session);
  }

  joinSession(session: Session) {
    window.open(session.meetingLink!, '_blank');
  }

  isPastSession(session: Session): boolean {
    if (!session.calendlyEndAt) return false;
    return new Date(session.calendlyEndAt) < new Date();
  }

  openPaymentModal(session: Session): void {
    this.activeSessionToJoin = session;
    this.showPaymentModal = true;
    this.isLoadingPayment = true;

    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      this.isLoadingPayment = false;
    }, 800);
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    document.body.style.overflow = '';

    // if (this.activeSessionToJoin?.meetingLink) {
    //   window.open(this.activeSessionToJoin.meetingLink, '_blank');
    //   this.activeSessionToJoin = null;
    // }

    this.showJoinConfirmModal = true;
  }

  closeJoinConfirmModal() {
    this.showJoinConfirmModal = false;
    document.body.style.overflow = '';
  }

  joinWithoutPayment() {
    if (this.activeSessionToJoin) {
      this.closeJoinConfirmModal();
      this.joinSession(this.activeSessionToJoin);
    }
  }

  payBeforeJoining() {
    if (this.activeSessionToJoin) {
      this.showJoinConfirmModal = false;
      this.openPaymentModal(this.activeSessionToJoin);
    }
  }

  private getSessionLoadError(err: any): string {
    if (err?.status === 401) {
      return 'Please sign in again to view your sessions.';
    }

    if (err?.status === 403) {
      return 'You do not have permission to view these sessions.';
    }

    return 'Unable to load your sessions right now. Please try again later.';
  }
}
