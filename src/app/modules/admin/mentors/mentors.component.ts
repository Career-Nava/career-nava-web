import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminMentor } from '../../../services/mentor/mentor.model';
import { MentorService } from '../../../services/mentor/mentor.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-admin-mentors',
  standalone: true,
  imports: [ NgClass, NgForOf, NgIf, SharedModule ],
  templateUrl: './mentors.component.html',
  styleUrl: './mentors.component.scss'
})
export class AdminMentorsComponent implements OnInit {
  mentors: AdminMentor[] = [];
  loading = true;
  error: string | null = null;

  constructor(private mentorService: MentorService) {
  }

  ngOnInit(): void {
    this.mentorService.getAdminMentors().subscribe({
      next: mentors => {
        this.mentors = mentors;
        this.error = null;
        this.loading = false;
      },
      error: err => {
        this.mentors = [];
        this.error = this.getMentorLoadError(err);
        this.loading = false;
      }
    });
  }

  trackMentor(index: number, mentor: AdminMentor): number | string {
    return mentor.mentorId ?? mentor.userId ?? mentor.email ?? index;
  }

  getStatusLabel(mentor: AdminMentor): string {
    if (mentor.isActive === true) {
      return 'Active';
    }

    if (mentor.isActive === false) {
      return 'Inactive';
    }

    return 'Unknown';
  }

  getStatusBadgeClass(mentor: AdminMentor): string {
    if (mentor.isActive === true) {
      return 'text-bg-success-subtle text-success-emphasis';
    }

    if (mentor.isActive === false) {
      return 'text-bg-secondary text-white';
    }

    return 'text-bg-light text-muted';
  }

  getCalendlyLabel(mentor: AdminMentor): string {
    if (mentor.calendlyConnected === true) {
      return 'Connected';
    }

    if (mentor.calendlyConnected === false) {
      return 'Not connected';
    }

    return 'Unknown';
  }

  getCalendlyBadgeClass(mentor: AdminMentor): string {
    if (mentor.calendlyConnected === true) {
      return 'text-bg-primary';
    }

    if (mentor.calendlyConnected === false) {
      return 'text-bg-warning text-dark';
    }

    return 'text-bg-light text-muted';
  }

  getTitleCompany(mentor: AdminMentor): string {
    const parts = [ mentor.title, mentor.company ].filter(Boolean);
    return parts.length ? parts.join(' / ') : '-';
  }

  getReviewsSummary(mentor: AdminMentor): string {
    const hasRating = typeof mentor.rating === 'number';
    const hasTotalReviews = typeof mentor.totalReviews === 'number';

    if (hasRating && hasTotalReviews) {
      return `${ mentor.rating!.toFixed(1) } (${ mentor.totalReviews })`;
    }

    if (hasRating) {
      return mentor.rating!.toFixed(1);
    }

    if (hasTotalReviews) {
      return `${ mentor.totalReviews }`;
    }

    return '-';
  }

  getSessionsSummary(mentor: AdminMentor): string {
    return typeof mentor.totalSessions === 'number' ? `${ mentor.totalSessions }` : '-';
  }

  private getMentorLoadError(err: any): string {
    if (err?.status === 401) {
      return 'Please sign in again to view mentors.';
    }

    if (err?.status === 403) {
      return 'You do not have access to view mentors.';
    }

    return 'Unable to load mentors right now. Please try again later.';
  }
}

