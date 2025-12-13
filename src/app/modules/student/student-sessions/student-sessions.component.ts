import { AsyncPipe, DatePipe, NgForOf, NgIf } from "@angular/common";
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faCalendar, faClock, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from "../../../services/auth/auth.service";
import { Session } from "../../../services/session/session.model";
import { SessionService } from "../../../services/session/session.service";
import { UserModel } from "../../../services/user/user.model";
import { CardSkeletonComponent } from "../../../shared/components/card-skeleton/card-skeleton.component";
import { SharedModule } from "../../../shared/shared.module";

@Component({
  selector: 'app-student-sessions',
  standalone: true,
  imports: [ NgIf, AsyncPipe, NgForOf, FaIconComponent, DatePipe, CardSkeletonComponent, SharedModule ],
  templateUrl: './student-sessions.component.html',
  styleUrls: [ './student-sessions.component.scss' ]
})
export class StudentSessionsComponent implements OnInit {

  faCalendar = faCalendar;
  faClock = faClock;
  faDotVertical = faEllipsisV;

  sessions: Session[] = [];

  loading = true;
  error: string | null = null;

  tab: 'active' | 'upcoming' | 'past' = 'active';

  // Payment modal state
  showPaymentModal = false;
  isLoadingPayment = false;

  paymentUrl = 'https://paystack.shop/pay/careernava_scholarship_coaching';
  safePaymentUrl!: SafeResourceUrl;

  user: UserModel | null = null;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
    this.safePaymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.paymentUrl);

    const user = this.authService.getUser();
    if (!user) {
      this.loading = false;
      return;
    }

    const menteeId = user.userId;

    this.sessionService.getSessionsByMentee(menteeId).subscribe({
      next: sessions => {
        this.sessions = sessions;
        this.loading = false;
      },
      error: err => {
        this.sessions = [];
        this.loading = false;
      }
    });
  }

  filterSessions(sessions: Session[]): Session[] {
    const now = new Date();
    switch (this.tab) {
      case 'upcoming':
        return sessions.filter(s => s.calendlyStartAt && new Date(s.calendlyStartAt) > now);
      case 'past':
        return sessions.filter(s => s.calendlyEndAt && new Date(s.calendlyEndAt) < now);
      default:
        return sessions;
    }
  }

  formatDuration(minutes: number): string {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${ minutes } min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${ hrs }h` : `${ hrs }h ${ mins }m`;
  }

  handleSessionClick(session: any) {
    if (session.status === 'pending') {
      this.openPaymentModal(session);
      return;
    }

    if (!session.meetingLink) {
      alert('Meeting link not available yet.');
      return;
    }

    window.open(session.meetingLink, '_blank');
  }

  openPaymentModal(session: any): void {
    this.showPaymentModal = true;
    this.isLoadingPayment = true;

    document.body.style.overflow = 'hidden'; // prevent background scroll

    setTimeout(() => {
      this.isLoadingPayment = false;
    }, 800);
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    document.body.style.overflow = ''; // restore scroll
  }
}
