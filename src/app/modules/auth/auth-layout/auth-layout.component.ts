import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Mentor } from "../../../services/mentor/mentor.model";
import { MentorService } from "../../../services/mentor/mentor.service";
import { SharedModule } from '../../../shared/shared/shared.module';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, SharedModule],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent implements OnInit {
  mentors: Mentor[] = [];

  constructor(private mentorService: MentorService) {}

  ngOnInit(): void {
    this.mentorService.getAllMentors().subscribe({
      next: (data) => {
        this.mentors = (data ?? []).map(m => ({
          ...m,

          profilePicture: m.profilePicture ?? 'assets/images/avatars/male-09.jpg',
          expertise: m.expertise ?? ["Product Design", "Design Systems"],
          disciplines: m.disciplines ?? ["UI/UX", "Interaction Design"],
          fluentIn: m.fluentIn ?? ["English", "French"],
          bio: m.bio ?? "I’m a Senior Product Designer at Facebook with over 7 years of experience designing intuitive digital experiences. I’ve mentored aspiring designers on portfolio reviews, design systems, and building case studies that stand out. I can help you sharpen your design process, prepare for interviews, and grow confidence in presenting your work.",
          experiences: m.experiences ?? [
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

        }));
        console.log('Mentors loaded:', this.mentors);
      },
      error: (err) => {
        console.error('Error loading mentors:', err);
        this.mentors = [];
      }
    });
  }

  getStars(rating: number = 0): number[] {
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
