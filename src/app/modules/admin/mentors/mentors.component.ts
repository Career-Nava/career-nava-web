import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { faEye, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AdminMentor } from '../../../services/mentor/mentor.model';
import { MentorService } from '../../../services/mentor/mentor.service';
import { SharedModule } from '../../../shared/shared.module';

type MentorStatusFilter = 'all' | 'active' | 'inactive' | 'unknown';

@Component({
  selector: 'app-admin-mentors',
  standalone: true,
  imports: [ DatePipe, NgClass, NgForOf, NgIf, SharedModule ],
  templateUrl: './mentors.component.html',
  styleUrl: './mentors.component.scss'
})
export class AdminMentorsComponent implements OnInit {
  protected readonly faPlus = faPlus;
  protected readonly faEye = faEye;
  protected readonly faPen = faPen;
  protected readonly faTrash = faTrash;

  mentors: AdminMentor[] = [];
  loading = true;
  error: string | null = null;

  searchQuery = '';
  statusFilter: MentorStatusFilter = 'all';

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

  get filteredMentors(): AdminMentor[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.mentors.filter(mentor => {
      const status = this.getNormalizedStatus(mentor);
      const matchesStatus = this.statusFilter === 'all' || status === this.statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        mentor.fullName,
        mentor.email,
        mentor.company,
        mentor.title
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }

  get totalMentors(): number {
    return this.mentors.length;
  }

  get activeMentors(): number {
    return this.mentors.filter(mentor => mentor.isActive === true).length;
  }

  get inactiveMentors(): number {
    return this.mentors.filter(mentor => mentor.isActive === false).length;
  }

  get filteredCount(): number {
    return this.filteredMentors.length;
  }

  trackMentor(index: number, mentor: AdminMentor): number | string {
    return mentor.mentorId ?? mentor.userId ?? mentor.email ?? index;
  }

  onSearch(value: string): void {
    this.searchQuery = value;
  }

  onStatusChange(value: string): void {
    this.statusFilter = value as MentorStatusFilter;
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
      return 'admin-badge--success';
    }

    if (mentor.isActive === false) {
      return 'admin-badge--muted';
    }

    return 'admin-badge--warning';
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
      return 'admin-badge--info';
    }

    if (mentor.calendlyConnected === false) {
      return 'admin-badge--warning';
    }

    return 'admin-badge--muted';
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

  getUpdatedTimestamp(mentor: AdminMentor): string | null {
    return mentor.updatedAt ?? mentor.createdAt ?? null;
  }

  getEmptyTitle(): string {
    return this.searchQuery || this.statusFilter !== 'all' ? 'No mentors match the current filters' : 'No mentors found';
  }

  getEmptyMessage(): string {
    if (this.searchQuery || this.statusFilter !== 'all') {
      return 'Try a broader search or switch back to all statuses to review more mentor records.';
    }

    return 'Mentor records will appear here once the backend returns admin-visible mentor data.';
  }

  private getNormalizedStatus(mentor: AdminMentor): MentorStatusFilter {
    if (mentor.isActive === true) {
      return 'active';
    }

    if (mentor.isActive === false) {
      return 'inactive';
    }

    return 'unknown';
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
