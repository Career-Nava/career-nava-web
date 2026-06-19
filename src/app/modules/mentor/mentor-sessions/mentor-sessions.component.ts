import { Component, OnInit } from '@angular/core';
import { SessionGroup, SessionGroupPanelComponent } from '../../shared/session-group-panel/session-group-panel.component';
import { Session } from '../../../services/session/session.model';
import { SessionService } from '../../../services/session/session.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-mentor-sessions',
  standalone: true,
  imports: [ SessionGroupPanelComponent, SharedModule ],
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

  get sessionGroups(): SessionGroup[] {
    return [
      {
        key: 'active',
        label: 'Active',
        sessions: this.filterSessions(this.sessions, 'active'),
        emptyMessage: 'You have no sessions scheduled for today.'
      },
      {
        key: 'upcoming',
        label: 'Upcoming',
        sessions: this.filterSessions(this.sessions, 'upcoming'),
        emptyMessage: 'You have no upcoming booked sessions.'
      },
      {
        key: 'past',
        label: 'Past',
        sessions: this.filterSessions(this.sessions, 'past'),
        emptyMessage: 'You have no completed or past sessions yet.'
      }
    ];
  }

  getSessionActionLabel = (session: Session): string => session.meetingLink ? 'Open meeting' : 'No meeting link yet';
  isSessionActionDisabled = (session: Session): boolean => !session.meetingLink;

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

  openMeeting(session: Session): void {
    if (!session.meetingLink) return;
    window.open(session.meetingLink, '_blank', 'noopener,noreferrer');
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
