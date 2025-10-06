import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MeetMentorsComponent } from '../../components/meet-mentors/meet-mentors.component';
import { Mentor } from '../../../services/mentors/IMentor';
import { MentorsService } from '../../../services/mentors/mentors.service';
import { SharedModule } from '../../../shared/shared/shared.module';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SharedModule,
  ],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {
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
