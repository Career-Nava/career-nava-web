import { NgForOf, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Session } from '../../../services/session/session.model';
import { CardSkeletonComponent } from '../../../shared/components/card-skeleton/card-skeleton.component';
import { SessionCardComponent, SessionCardContext } from '../session-card/session-card.component';

export type SessionGroupKey = 'active' | 'upcoming' | 'past';

export interface SessionGroup {
  key: SessionGroupKey;
  label: string;
  sessions: Session[];
  emptyTitle?: string;
  emptyMessage: string;
}

@Component({
  selector: 'app-session-group-panel',
  standalone: true,
  imports: [ CardSkeletonComponent, NgForOf, NgIf, SessionCardComponent ],
  templateUrl: './session-group-panel.component.html',
  styleUrl: './session-group-panel.component.scss'
})
export class SessionGroupPanelComponent {
  @Input() pageTitle = 'My Sessions';
  @Input() pageDescription = '';
  @Input() panelTitle = 'My Sessions';
  @Input() panelDescription = '';
  @Input() context: SessionCardContext = 'mentee';
  @Input() groups: SessionGroup[] = [];
  @Input() loading = false;
  @Input() errorMessage: string | null = null;
  @Input() skeletonCount = 3;
  @Input() emptyImageSrc = 'assets/icons/Virtual-Meeting.png';
  @Input() emptyImageAlt = 'No sessions';
  @Input() actionLabel: (session: Session) => string = () => 'Join Session';
  @Input() actionDisabled: (session: Session) => boolean = () => false;

  @Output() sessionAction = new EventEmitter<Session>();

  activeGroupKey: SessionGroupKey = 'active';

  get activeGroup(): SessionGroup | undefined {
    return this.groups.find(group => group.key === this.activeGroupKey) ?? this.groups[0];
  }

  setActiveGroup(group: SessionGroup): void {
    this.activeGroupKey = group.key;
  }

  trackGroup(_: number, group: SessionGroup): SessionGroupKey {
    return group.key;
  }

  trackSession(_: number, session: Session): number {
    return session.sessionId;
  }
}
