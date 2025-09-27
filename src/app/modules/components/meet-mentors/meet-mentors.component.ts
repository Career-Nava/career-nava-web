import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared/shared.module';
import { faStar, faStarHalfStroke, faComments, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { Mentor } from '../../../services/mentors/IMentor';
import { MentorsService } from '../../../services/mentors/mentors.service';

@Component({
  selector: 'app-meet-mentors',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './meet-mentors.component.html',
  styleUrl: './meet-mentors.component.scss'
})
export class MeetMentorsComponent implements OnInit {
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

  get mentorGroups() {
    const size = 3;
    const groups = [];
    for (let i = 0; i < this.mentors.length; i += size) {
      groups.push(this.mentors.slice(i, i + size));
    }
    return groups;
  }


}
