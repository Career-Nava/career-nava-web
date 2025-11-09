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
      next: (data) => {
        this.mentors = (data ?? []).map((m) => ({
          ...m,
          // Keep fallbacks from your original code
          profilePicture: m.profilePicture ?? 'assets/images/avatars/male-09.jpg',
          expertise: m.expertise ?? [ 'Product Design', 'Design Systems' ],
          disciplines: m.disciplines ?? [ 'UI/UX', 'Interaction Design' ],
          fluentIn: m.fluentIn ?? [ 'English', 'French' ],
          bio: m.bio ?? 'I’m a Senior Product Designer with over 7 years of experience designing intuitive digital experiences. I can help you sharpen your design process, prepare for interviews, and build strong portfolios.',
          experiences: m.experiences ?? [
            {
              title: 'Senior Product Designer',
              description: 'Led product design teams focusing on scalable design systems and cross-platform experiences.',
              year: '2020 - Present',
              companyImage: 'assets/images/clients/chevening-sc.webp'
            },
            {
              title: 'UI/UX Designer',
              description: 'Worked on multiple client projects delivering mobile-first solutions.',
              year: '2017 - 2020',
              companyImage: 'assets/images/clients/google.svg'
            }
          ],
          // ensure defaults for numeric fields to avoid template issues
          totalSessions: m.totalSessions ?? 0,
          totalReviews: m.totalReviews ?? 0,
          avgRating: typeof m.avgRating === 'number' ? m.avgRating : 0,
          positionTitle: m.positionTitle ?? '',
          company: m.company ?? ''
        }));
        console.log('Mentors loaded:', this.mentors);
      },
      error: (err) => {
        console.error('Error loading mentors:', err);
        this.mentors = [];
      }
    });
  }

  getStars(rating: number = 0): any[] {
    const full = Math.floor(rating);
    return new Array(full);
  }
}
