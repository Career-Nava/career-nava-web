import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBriefcase, faComments, faStar as faStarFull, faStarHalfStroke as faStarHalf } from '@fortawesome/free-solid-svg-icons';
import { Mentor } from '../../../services/mentor/mentor.model';
import { MentorService } from '../../../services/mentor/mentor.service';
import { SharedModule } from '../../../shared/shared/shared.module';

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
  faStarFull = faStarFull;
  faStarHalf = faStarHalf;

  mentors: Mentor[] = [];

  constructor(private mentorService: MentorService) {
  }

  ngOnInit(): void {
    this.mentorService.getAllMentors().subscribe({
      next: (data) => (this.mentors = data),
      error: () => (this.mentors = [])
    });
  }

  getStars(rating: number = 0): any[] {
    const full = Math.floor(rating);
    return new Array(full);
  }
}
