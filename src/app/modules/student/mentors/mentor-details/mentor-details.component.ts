import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, switchMap, take } from 'rxjs';
import { Mentor } from '../../../../services/mentor/mentor.model';
import { MentorService } from '../../../../services/mentor/mentor.service';

@Component({
  selector: 'app-mentor-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mentor-details.component.html',
  styleUrls: ['./mentor-details.component.scss']
})
export class MentorDetailsComponent implements OnInit {
  mentor?: Mentor;
  isLoading = true;
  hasError = false;

  constructor(
    private mentorService: MentorService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(params => Number(params.get('id'))),
        filter(id => !isNaN(id) && id > 0),
        switchMap(id => this.mentorService.getMentorById(id)),
        take(1)
      )
      .subscribe({
        next: mentor => {
          this.mentor = {
            ...mentor,

            profilePicture: mentor.profilePicture ?? 'assets/images/avatars/male-09.jpg',
            expertise: mentor.expertise ?? ["Product Design", "Design Systems"],
            disciplines: mentor.disciplines ?? ["UI/UX", "Interaction Design"],
            fluentIn: mentor.fluentIn ?? ["English", "French"],
            bio: mentor.bio ?? "I’m a Senior Product Designer at Facebook with over 7 years of experience designing intuitive digital experiences. I’ve mentored aspiring designers on portfolio reviews, design systems, and building case studies that stand out. I can help you sharpen your design process, prepare for interviews, and grow confidence in presenting your work.",
            experiences: mentor.experiences ?? [
              {
                title: "Senior Product Designer",
                description: "Led product design teams focusing on scalable design systems and cross-platform experiences.",
                year: "2020 - Present",
                companyImage: "assets/images/clients/chevening-sc.webp"
              },
              {
                title: "UI/UX Designer",
                description: "Worked on multiple client projects delivering mobile-first solutions.",
                year: "2017 - 2020",
                companyImage: "assets/images/clients/google.svg"
              }
            ]

          }
          this.isLoading = false;
          console.log('✅ Mentor loaded successfully:', mentor);
        },
        error: err => {
          console.error('❌ Failed to load mentor:', err);
          this.isLoading = false;
          this.hasError = true;
        }
      });
  }
}
