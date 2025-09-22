import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared/shared.module';
import { faBriefcase, faCalendar, faClock, faComments, faEllipsisV, faStar, faStarHalfStroke } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-mentors',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './mentors.component.html',
  styleUrl: './mentors.component.scss'
})
export class MentorsComponent {
  faCalendar = faCalendar;
  faClock = faClock;
  faDotVertical = faEllipsisV;
  faBriefcase = faBriefcase;
  faStarFull = faStar;
  faStarHalf = faStarHalfStroke;
  faComments = faComments

}
