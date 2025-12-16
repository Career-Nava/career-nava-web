import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBriefcase, faComments } from '@fortawesome/free-solid-svg-icons';
import { Mentor } from '../../../services/mentor/mentor.model';
import { MentorService } from '../../../services/mentor/mentor.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-meet-mentors',
  standalone: true,
  imports: [ SharedModule, FontAwesomeModule ],
  templateUrl: './meet-mentors.component.html',
  styleUrls: [ './meet-mentors.component.scss' ]
})
export class MeetMentorsComponent implements OnInit {
  faBriefcase = faBriefcase;
  faComments = faComments;

  mentors: Mentor[] = [];

  constructor(private mentorService: MentorService) {
  }

  ngOnInit(): void {
    this.mentorService.getAllMentors().subscribe({
      next: (data) => {
        this.mentors = this.getRandomMentors(data, 4);
      },
      error: () => (this.mentors = [])
    });
  }

  private getRandomMentors(mentors: Mentor[], count: number): Mentor[] {
    return mentors
      .slice() // avoid mutating original array
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }
}
