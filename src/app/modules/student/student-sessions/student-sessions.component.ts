import { Component } from '@angular/core';
import { faCalendar, faClock, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AssignmentsService } from '../../../services/assignments/assignments.service';
import { SharedModule } from '../../../shared/shared/shared.module';
import { SessionsService } from '../../../services/sessions/sessions.service';
import { ISessions } from '../../../services/sessions/ISessions';

@Component({
  selector: 'app-student-sessions',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './student-sessions.component.html',
  styleUrl: './student-sessions.component.scss'
})
export class StudentSessionsComponent {
faCalendar = faCalendar;
  faClock = faClock;
  faDotVertical = faEllipsisV;

  private subscriptions: Subscription = new Subscription();
  
  sessions: ISessions[] = [];

  constructor(private assignmentService: AssignmentsService, private sessionService: SessionsService) {
  }
  
  ngOnInit(): void {
    this.loadSessions();
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  private loadSessions(): void {
    this.subscriptions.add(this.sessionService.getSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        console.log('Sessions:', this.sessions);
      },
      error: (e) => console.error('Failed to load sessions', e)
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Clean up the subscription
  }
}
