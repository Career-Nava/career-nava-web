import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { faArrowUpRightFromSquare, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AdminScholarship } from '../../../services/scholarship/shcolarship.model';
import { ScholarshipService } from '../../../services/scholarship/scholarship.service';
import { SharedModule } from '../../../shared/shared.module';

type ScholarshipStatusFilter = 'all' | 'active' | 'inactive' | 'unknown';

@Component({
  selector: 'app-admin-scholarships',
  standalone: true,
  imports: [ DatePipe, NgClass, NgForOf, NgIf, SharedModule ],
  templateUrl: './scholarships.component.html',
  styleUrl: './scholarships.component.scss'
})
export class AdminScholarshipsComponent implements OnInit {
  protected readonly faPlus = faPlus;
  protected readonly faPen = faPen;
  protected readonly faTrash = faTrash;
  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;

  scholarships: AdminScholarship[] = [];
  loading = true;
  error: string | null = null;

  searchQuery = '';
  statusFilter: ScholarshipStatusFilter = 'all';

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

  get filteredScholarships(): AdminScholarship[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.scholarships.filter(scholarship => {
      const normalizedStatus = this.getNormalizedStatus(scholarship);
      const matchesStatus = this.statusFilter === 'all' || normalizedStatus === this.statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        scholarship.title,
        scholarship.category,
        scholarship.funding,
        scholarship.shortDescription,
        scholarship.role
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }

  get totalScholarships(): number {
    return this.scholarships.length;
  }

  get activeScholarships(): number {
    return this.scholarships.filter(scholarship => this.getNormalizedStatus(scholarship) === 'active').length;
  }

  get filteredCount(): number {
    return this.filteredScholarships.length;
  }

  trackScholarship(index: number, scholarship: AdminScholarship): number | string {
    return scholarship.scholarshipId ?? scholarship.title ?? index;
  }

  onSearch(value: string): void {
    this.searchQuery = value;
  }

  onStatusChange(value: string): void {
    this.statusFilter = value as ScholarshipStatusFilter;
  }

  getStatusLabel(scholarship: AdminScholarship): string {
    return scholarship.status || 'Unknown';
  }

  getStatusBadgeClass(scholarship: AdminScholarship): string {
    const status = scholarship.status?.toLowerCase();

    if (status === 'active' || status === 'open' || status === 'published') {
      return 'admin-badge--success';
    }

    if (status === 'inactive' || status === 'closed' || status === 'draft') {
      return 'admin-badge--muted';
    }

    return 'admin-badge--warning';
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

  getUpdatedTimestamp(scholarship: AdminScholarship): string | null {
    return scholarship.updatedAt ?? scholarship.createdAt ?? null;
  }

  getEmptyTitle(): string {
    return this.searchQuery || this.statusFilter !== 'all' ? 'No scholarships match the current filters' : 'No scholarships found';
  }

  getEmptyMessage(): string {
    if (this.searchQuery || this.statusFilter !== 'all') {
      return 'Try a broader search or switch back to all statuses to review more scholarship records.';
    }

    return 'Scholarship records will appear here once the backend returns admin-visible scholarship data.';
  }

  private getNormalizedStatus(scholarship: AdminScholarship): ScholarshipStatusFilter {
    const status = scholarship.status?.toLowerCase();

    if (status === 'active' || status === 'open' || status === 'published') {
      return 'active';
    }

    if (status === 'inactive' || status === 'closed' || status === 'draft') {
      return 'inactive';
    }

    return 'unknown';
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
