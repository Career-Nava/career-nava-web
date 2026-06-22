import { DatePipe, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';
import { Session } from '../../../services/session/session.model';

export type SessionCardContext = 'mentee' | 'mentor';

@Component({
  selector: 'app-session-card',
  standalone: true,
  imports: [ DatePipe, FaIconComponent, NgClass, NgIf ],
  templateUrl: './session-card.component.html',
  styleUrl: './session-card.component.scss'
})
export class SessionCardComponent {
  @Input({ required: true }) session!: Session;
  @Input() context: SessionCardContext = 'mentee';
  @Input() actionLabel = 'Join Session';
  @Input() actionDisabled = false;
  @Input() showAction = true;

  @Output() action = new EventEmitter<Session>();

  faCalendar = faCalendar;
  faClock = faClock;

  get participantLabel(): string {
    return this.context === 'mentor' ? 'Mentee' : 'Mentor';
  }

  get participantName(): string {
    if (this.context === 'mentor') {
      return this.session.menteeName || 'Mentee';
    }

    return this.session.mentorName || 'Mentor';
  }

  get participantEmail(): string | null {
    if (this.context !== 'mentor') return null;
    return this.session.menteeEmail || null;
  }

  get fallbackDescription(): string {
    if (this.context === 'mentor') {
      return 'One-on-one Career Nava session booked with this mentee.';
    }

    return 'One-on-one career coaching focused on resume, interview prep, and career guidance.';
  }

  get statusLabel(): string {
    return this.session.status || 'unknown';
  }

  get statusClass(): string {
    const status = (this.session.status || '').toLowerCase();

    if (status === 'pending') {
      return 'session-chip--pending';
    }

    if (status === 'cancelled' || status === 'canceled') {
      return 'session-chip--danger';
    }

    if (status === 'past' || status === 'completed') {
      return 'session-chip--muted';
    }

    if (status === 'approved' || status === 'confirmed' || status === 'paid' || status === 'active') {
      return 'session-chip--success';
    }

    return 'session-chip--default';
  }

  get sessionCategoryLabel(): string {
    if (this.session.category) {
      return this.session.category;
    }

    return this.context === 'mentor' ? 'mentorship booking' : 'guidance session';
  }

  formatDuration(minutes: number): string {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${ minutes } min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${ hrs }h` : `${ hrs }h ${ mins }m`;
  }

  handleAction(): void {
    if (this.actionDisabled) return;
    this.action.emit(this.session);
  }
}
