import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Mentor } from "../../../services/mentor/mentor.model";
import { MentorService } from "../../../services/mentor/mentor.service";
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [ RouterOutlet, SharedModule ],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent implements OnInit {
  mentors: Mentor[] = [];

  constructor(private mentorService: MentorService) {
  }

  ngOnInit(): void {
    this.mentorService.getAllMentors()
      .subscribe({ next: data => this.mentors = data });
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
