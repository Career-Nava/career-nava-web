import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Session } from '../../../services/session/session.model';
import { SessionService } from '../../../services/session/session.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-mentor-sessions',
  standalone: true,
  imports: [ DatePipe, NgForOf, NgIf, SharedModule ],
  templateUrl: './mentor-sessions.component.html',
  styleUrl: './mentor-sessions.component.scss'
})
export class MentorSessionsComponent implements OnInit {
  sessions: Session[] = [];
  loading = true;
  error: string | null = null;

  constructor(private sessionService: SessionService) {
  }

  ngOnInit(): void {
    this.sessionService.getMyMentorSessions().subscribe({
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

  formatDuration(minutes: number): string {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${ minutes } min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${ hrs }h` : `${ hrs }h ${ mins }m`;
  }

  trackSession(_: number, session: Session): number {
    return session.sessionId;
  }

  private getSessionLoadError(err: any): string {
    if (err?.status === 401) {
      return 'Please sign in again to view your mentor sessions.';
    }

    if (err?.status === 403) {
      return 'You do not have permission to view mentor sessions.';
    }

    return 'Unable to load mentor sessions right now. Please try again later.';
  }
}
