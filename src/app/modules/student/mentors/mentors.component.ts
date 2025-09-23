import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared/shared.module';
import { faBriefcase, faCalendar, faClock, faComments, faEllipsisV, faStar, faStarHalfStroke } from '@fortawesome/free-solid-svg-icons';
import { MentorsService } from '../../../services/mentors/mentors.service';
import { Mentor } from '../../../services/mentors/IMentor';

@Component({
  selector: 'app-mentors',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './mentors.component.html',
  styleUrl: './mentors.component.scss'
})
export class MentorsComponent implements OnInit {
  faCalendar = faCalendar;
  faClock = faClock;
  faDotVertical = faEllipsisV;
  faBriefcase = faBriefcase;
  faStarFull = faStar;
  faStarHalf = faStarHalfStroke;
  faComments = faComments

  mentors: Mentor[] = [];

  constructor( private mentorService: MentorsService){}

  ngOnInit(): void {
    this.mentorService.getMentors().subscribe({
      next: (data) => {
        this.mentors = data;
        console.log('Mentors loaded:', this.mentors);
      },
      error: (err) => {
        console.error('Error loading mentors:', err); 
      }
    });
  }

  getStars(rating: number): number[] {
  return Array(Math.floor(rating)).fill(0);
}

}
