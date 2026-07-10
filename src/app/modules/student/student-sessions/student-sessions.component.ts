import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { PaymentInitializationResponse } from '../../../services/payment/payment.model';
import { PaymentService } from '../../../services/payment/payment.service';
import { Session } from '../../../services/session/session.model';
import { SessionService } from '../../../services/session/session.service';
import { SharedModule } from '../../../shared/shared.module';
import { SessionGroup, SessionGroupPanelComponent } from '../../shared/session-group-panel/session-group-panel.component';

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

  showPaymentModal = false;
  isLoadingPayment = false;
  initializingPaymentSessionId: number | null = null;
  verifyingPaymentSessionId: number | null = null;
  activePayment: PaymentInitializationResponse | null = null;
  paymentError: string | null = null;
  paymentMessage: string | null = null;
  safePaymentUrl: SafeResourceUrl | null = null;

  showJoinConfirmModal = false;

  constructor(
    private sessionService: SessionService,
    private paymentService: PaymentService,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
    this.loadSessions();
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

  isSessionActionDisabled = (session: Session): boolean =>
    this.isPastSession(session) ||
    this.initializingPaymentSessionId === session.sessionId ||
    this.verifyingPaymentSessionId === session.sessionId;

  getSessionActionLabel = (session: Session): string => {
    if (this.initializingPaymentSessionId === session.sessionId) {
      return 'Preparing payment...';
    }

    if (this.isPaymentRequired(session) && !this.hasVerifiedPayment(session)) {
      return 'Pay & Join';
    }

    return 'Join Session';
  };

  handleSessionClick(session: Session): void {
    if (this.isPaymentRequired(session) && !this.hasVerifiedPayment(session)) {
      this.activeSessionToJoin = session;
      this.showJoinConfirmModal = true;
      document.body.style.overflow = 'hidden';
      return;
    }

    if (!session.meetingLink) {
      this.error = 'Meeting link not available yet.';
      return;
    }

    this.joinSession(session);
  }

  joinSession(session: Session): void {
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
    this.initializingPaymentSessionId = session.sessionId;
    this.activePayment = null;
    this.paymentError = null;
    this.paymentMessage = null;
    this.safePaymentUrl = null;

    document.body.style.overflow = 'hidden';

    this.paymentService.initializeSessionPayment(session.sessionId).subscribe({
      next: payment => {
        this.activePayment = payment;
        this.paymentMessage = payment.message || 'Payment checkout is ready.';

        if (!payment.authorizationUrl) {
          this.paymentError = 'Payment checkout is not configured yet. Please try again later.';
          return;
        }

        this.safePaymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(payment.authorizationUrl);
      },
      error: err => {
        this.paymentError = this.getPaymentError(err, 'Unable to prepare payment checkout. Please try again later.');
      },
      complete: () => {
        this.isLoadingPayment = false;
        this.initializingPaymentSessionId = null;
      }
    });
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    document.body.style.overflow = '';
    this.isLoadingPayment = false;
    this.initializingPaymentSessionId = null;
    this.verifyingPaymentSessionId = null;
    this.safePaymentUrl = null;
  }

  closeJoinConfirmModal(): void {
    this.showJoinConfirmModal = false;
    document.body.style.overflow = '';
  }

  payBeforeJoining(): void {
    if (this.activeSessionToJoin) {
      this.showJoinConfirmModal = false;
      this.openPaymentModal(this.activeSessionToJoin);
    }
  }

  verifyActivePayment(): void {
    if (!this.activePayment || !this.activeSessionToJoin) {
      this.paymentError = 'Payment details are not available. Please start checkout again.';
      return;
    }

    this.paymentError = null;
    this.paymentMessage = null;
    this.verifyingPaymentSessionId = this.activeSessionToJoin.sessionId;

    this.paymentService.verifyPayment({ paymentId: this.activePayment.paymentId }).subscribe({
      next: result => {
        this.paymentMessage = result.message || 'Payment verification completed.';

        if (!result.hasPaidPayment || result.status !== 'paid') {
          this.paymentError = 'Payment has not been confirmed yet. Please complete payment and try verification again.';
          return;
        }

        this.paymentError = null;
        this.paymentMessage = 'Payment confirmed. Your session is ready to join when the meeting link is available.';
        this.loadSessions(false);
      },
      error: err => {
        this.paymentError = this.getPaymentError(err, 'Unable to verify payment right now. Please try again.');
      },
      complete: () => {
        this.verifyingPaymentSessionId = null;
      }
    });
  }

  private loadSessions(showLoading = true): void {
    if (showLoading) {
      this.loading = true;
    }

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

  private isPaymentRequired(session: Session): boolean {
    return session.isPaymentRequired === true || session.isFreeSession === false;
  }

  private hasVerifiedPayment(session: Session): boolean {
    return session.hasPaidPayment === true ||
      session.paymentStatus === 'paid' ||
      session.status === 'booked';
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

  private getPaymentError(err: any, fallback: string): string {
    if (err?.status === 401) {
      return 'Please sign in again to continue payment.';
    }

    if (err?.status === 403) {
      return 'You do not have permission to pay for this session.';
    }

    return fallback;
  }
}
