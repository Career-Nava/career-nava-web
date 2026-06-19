import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminScholarship } from '../../../services/scholarship/shcolarship.model';
import { ScholarshipService } from '../../../services/scholarship/scholarship.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-admin-scholarships',
  standalone: true,
  imports: [ DatePipe, NgClass, NgForOf, NgIf, SharedModule ],
  templateUrl: './scholarships.component.html',
  styleUrl: './scholarships.component.scss'
})
export class AdminScholarshipsComponent implements OnInit {
  scholarships: AdminScholarship[] = [];
  loading = true;
  error: string | null = null;

  constructor(private scholarshipService: ScholarshipService) {
  }

  ngOnInit(): void {
    this.scholarshipService.getAdminScholarships().subscribe({
      next: scholarships => {
        this.scholarships = scholarships;
        this.error = null;
        this.loading = false;
      },
      error: err => {
        this.scholarships = [];
        this.error = this.getScholarshipLoadError(err);
        this.loading = false;
      }
    });
  }

  trackScholarship(index: number, scholarship: AdminScholarship): number | string {
    return scholarship.scholarshipId ?? scholarship.title ?? index;
  }

  getStatusLabel(scholarship: AdminScholarship): string {
    if (!scholarship.status) {
      return 'Unknown';
    }

    return scholarship.status;
  }

  getStatusBadgeClass(scholarship: AdminScholarship): string {
    const status = scholarship.status?.toLowerCase();

    if (status === 'active' || status === 'open' || status === 'published') {
      return 'text-bg-success-subtle text-success-emphasis';
    }

    if (status === 'inactive' || status === 'closed' || status === 'draft') {
      return 'text-bg-secondary text-white';
    }

    return 'text-bg-light text-muted';
  }

  getDeadline(scholarship: AdminScholarship): string | null {
    return scholarship.deadline ?? scholarship.closingDate ?? null;
  }

  getBenefitsCount(scholarship: AdminScholarship): string {
    return typeof scholarship.benefitsCount === 'number' ? `${ scholarship.benefitsCount }` : '-';
  }

  getInterestedCount(scholarship: AdminScholarship): string {
    return typeof scholarship.interestedCount === 'number' ? `${ scholarship.interestedCount }` : '-';
  }

  private getScholarshipLoadError(err: any): string {
    if (err?.status === 401) {
      return 'Please sign in again to view scholarships.';
    }

    if (err?.status === 403) {
      return 'You do not have access to view scholarships.';
    }

    return 'Unable to load scholarships right now. Please try again later.';
  }
}
