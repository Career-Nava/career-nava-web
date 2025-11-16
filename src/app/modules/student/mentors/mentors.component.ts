import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBriefcase, faComments, faStar, faStarHalfStroke } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { Mentor } from "../../../services/mentor/mentor.model";
import { MentorService } from "../../../services/mentor/mentor.service";
import { SharedModule } from '../../../shared/shared/shared.module';

@Component({
  selector: 'app-mentors',
  standalone: true,
  imports: [ CommonModule, RouterModule, FontAwesomeModule, SharedModule ],
  templateUrl: './mentors.component.html',
  styleUrls: [ './mentors.component.scss' ]
})
export class MentorsComponent implements OnInit {

  // FontAwesome icons
  faBriefcase = faBriefcase;
  faComments = faComments;
  faStarFull = faStar;
  faStarHalf = faStarHalfStroke;

  mentors$!: Observable<Mentor[]>; // use async pipe for cleaner template
  loading = true;
  error: string | null = null;

  constructor(private mentorService: MentorService) {
  }

  ngOnInit(): void {
    this.mentors$ = this.mentorService.getAllMentors();
    this.mentors$.subscribe({
      next: () => this.loading = false,
      error: (err) => {
        this.error = 'Failed to load mentors. Please try again later.';
        console.error('Error loading mentors:', err);
        this.loading = false;
      }
    });
  }

  // returns full star icons count
  getStars(rating: number = 0): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  // returns true if there's a half star
  hasHalfStar(rating: number = 0): boolean {
    return rating % 1 !== 0;
  }
}
