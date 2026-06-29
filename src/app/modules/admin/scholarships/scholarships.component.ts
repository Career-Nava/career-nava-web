import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faArrowUpRightFromSquare, faEye, faFilter, faPen, faPlus, faRotateRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import { finalize, of, switchMap } from 'rxjs';
import { AdminScholarship, AdminScholarshipUpsert } from '../../../services/scholarship/shcolarship.model';
import { ScholarshipService } from '../../../services/scholarship/scholarship.service';
import { ToastService } from '../../../services/toast.service';
import { SharedModule } from '../../../shared/shared.module';

type ScholarshipStatusFilter = 'all' | 'draft' | 'published' | 'closed' | 'archived' | 'unknown';
type ScholarshipMode = 'none' | 'detail' | 'edit' | 'create';

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
  protected readonly faEye = faEye;
  protected readonly faFilter = faFilter;
  protected readonly faRotateRight = faRotateRight;
  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  protected readonly faXmark = faXmark;

  scholarships: AdminScholarship[] = [];
  selectedScholarship: AdminScholarship | null = null;
  loading = true;
  saving = false;
  error: string | null = null;
  actionError: string | null = null;
  actionMessage: string | null = null;
  mode: ScholarshipMode = 'none';

  searchQuery = '';
  statusFilter: ScholarshipStatusFilter = 'all';
  filtersExpanded = false;

  scholarshipForm: FormGroup = this.fb.group({
    mentorProfileId: [ null ],
    title: [ '', Validators.required ],
    link: [ '', Validators.required ],
    role: [ '', Validators.required ],
    imageThumbnail: [ '' ],
    datePosted: [ this.today(), Validators.required ],
    applicationDeadline: [ this.today(), Validators.required ],
    category: [ '', Validators.required ],
    shortDescription: [ '', Validators.required ],
    funding: [ 'fully_funded', Validators.required ],
    contentDescription: [ '', Validators.required ],
    eligibilityCriteria: [ '', Validators.required ],
    status: [ 'draft', Validators.required ],
    benefits: this.fb.array([])
  });

  constructor(
    private scholarshipService: ScholarshipService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
  }

  ngOnInit(): void {
    this.loadScholarships();
  }

  get benefits(): FormArray {
    return this.scholarshipForm.get('benefits') as FormArray;
  }

  loadScholarships(): void {
    this.loading = true;
    this.scholarshipService.getAdminScholarships().subscribe({
      next: scholarships => {
        this.scholarships = scholarships;
        this.error = null;
        this.loading = false;
      },
      error: err => {
        this.scholarships = [];
        this.error = this.getLoadError(err);
        this.loading = false;
      }
    });
  }

  get filteredScholarships(): AdminScholarship[] {
    const query = this.searchQuery.trim().toLowerCase();
    return this.scholarships.filter(s => {
      const status = this.normalizeStatus(s.status);
      if (this.statusFilter !== 'all' && status !== this.statusFilter) return false;
      if (!query) return true;
      return [ s.title, s.category, s.funding, s.shortDescription, s.role, s.status ].filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  }

  get totalScholarships(): number { return this.scholarships.length; }
  get publishedScholarships(): number { return this.scholarships.filter(s => this.normalizeStatus(s.status) === 'published').length; }
  get filteredCount(): number { return this.filteredScholarships.length; }
  get showClearFilters(): boolean { return this.filtersExpanded || !!this.searchQuery.trim() || this.statusFilter !== 'all'; }

  trackScholarship(index: number, scholarship: AdminScholarship): number | string {
    return scholarship.scholarshipId ?? scholarship.title ?? index;
  }

  onSearch(value: string): void { this.searchQuery = value; }
  toggleFilters(): void { this.filtersExpanded = !this.filtersExpanded; }
  onStatusChange(value: string): void { this.statusFilter = value as ScholarshipStatusFilter; }
  clearFilters(): void { this.searchQuery = ''; this.statusFilter = 'all'; }

  openCreate(): void {
    this.mode = 'create';
    this.selectedScholarship = null;
    this.actionError = null;
    this.actionMessage = null;
    this.scholarshipForm.reset({
      mentorProfileId: null,
      datePosted: this.today(),
      applicationDeadline: this.today(),
      funding: 'fully_funded',
      status: 'draft'
    });
    this.benefits.clear();
    this.addBenefit();
  }

  viewScholarship(scholarship: AdminScholarship): void {
    if (!scholarship.scholarshipId) return;
    this.mode = 'detail';
    this.actionError = null;
    this.scholarshipService.getAdminScholarshipById(scholarship.scholarshipId).subscribe({
      next: detail => this.selectedScholarship = detail,
      error: err => this.actionError = this.getActionError(err, 'Unable to load scholarship detail.')
    });
  }

  editScholarship(scholarship: AdminScholarship): void {
    if (!scholarship.scholarshipId) return;
    this.mode = 'edit';
    this.actionError = null;
    this.scholarshipService.getAdminScholarshipById(scholarship.scholarshipId).subscribe({
      next: detail => {
        this.selectedScholarship = detail;
        this.patchForm(detail);
      },
      error: err => this.actionError = this.getActionError(err, 'Unable to load scholarship detail.')
    });
  }

  saveScholarship(): void {
    if (this.scholarshipForm.invalid) {
      this.scholarshipForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    const request = this.mode === 'edit' && this.selectedScholarship?.scholarshipId
      ? this.scholarshipService.updateAdminScholarship(this.selectedScholarship.scholarshipId, payload)
      : this.scholarshipService.createAdminScholarship(payload);

    this.saving = true;
    request
      .pipe(
        switchMap(scholarship => this.applyScholarshipStatus(scholarship, payload.status || 'draft')),
        finalize(() => this.saving = false)
      )
      .subscribe({
      next: scholarship => this.afterMutation(this.mode === 'edit' ? 'Scholarship updated.' : 'Scholarship created.', scholarship),
      error: err => this.actionError = this.getActionError(err, 'Unable to save scholarship.')
    });
  }

  addBenefit(value = ''): void {
    this.benefits.push(this.fb.control(value));
  }

  removeBenefit(index: number): void {
    this.benefits.removeAt(index);
  }

  closePanel(): void {
    this.mode = 'none';
    this.selectedScholarship = null;
    this.actionError = null;
    this.actionMessage = null;
  }

  getStatusBadgeClass(scholarship: AdminScholarship): string {
    const status = this.normalizeStatus(scholarship.status);
    if (status === 'published') return 'admin-badge--success';
    if (status === 'closed' || status === 'archived') return 'admin-badge--danger';
    if (status === 'draft') return 'admin-badge--warning';
    return 'admin-badge--muted';
  }

  getDeadline(scholarship: AdminScholarship): string | null {
    return scholarship.deadline ?? scholarship.closingDate ?? scholarship.applicationDeadline ?? null;
  }

  getBenefitsCount(scholarship: AdminScholarship): string {
    return `${ scholarship.benefitsCount ?? scholarship.benefits?.length ?? 0 }`;
  }

  canPreviewScholarship(scholarship: AdminScholarship): boolean {
    return !!scholarship.scholarshipId && this.normalizeStatus(scholarship.status) === 'published';
  }

  showPreviewUnavailable(): void {
    this.toast.show('Publish this scholarship before public preview.', {
      classname: 'bg-warning text-dark',
      delay: 3500
    });
  }

  getEmptyTitle(): string {
    return this.searchQuery || this.statusFilter !== 'all' ? 'No scholarships match the current filters' : 'No scholarships found';
  }

  getEmptyMessage(): string {
    return this.searchQuery || this.statusFilter !== 'all'
      ? 'Try a broader search or switch back to all statuses.'
      : 'Scholarship records will appear here after they are created.';
  }

  private patchForm(s: AdminScholarship): void {
    this.scholarshipForm.patchValue({
      mentorProfileId: s.mentorProfileId ?? null,
      title: s.title ?? '',
      link: s.link ?? '',
      role: s.role ?? '',
      imageThumbnail: s.imageThumbnail ?? s.image ?? '',
      datePosted: this.toDateInput(s.datePosted ?? s.openingDate),
      applicationDeadline: this.toDateInput(s.applicationDeadline ?? s.closingDate),
      category: s.category ?? '',
      shortDescription: s.shortDescription ?? '',
      funding: s.funding ?? 'fully_funded',
      contentDescription: s.contentDescription ?? s.description ?? '',
      eligibilityCriteria: s.eligibilityCriteria ?? '',
      status: s.status ?? 'draft'
    });
    this.benefits.clear();
    (s.benefits?.length ? s.benefits : [ { benefitText: '' } ]).forEach(b => this.addBenefit(b.benefitText ?? ''));
  }

  private buildPayload(): AdminScholarshipUpsert {
    const value = this.scholarshipForm.value;
    return {
      ...value,
      datePosted: value.datePosted ? new Date(value.datePosted).toISOString() : null,
      applicationDeadline: value.applicationDeadline ? new Date(value.applicationDeadline).toISOString() : null,
      benefits: (value.benefits ?? []).filter((benefit: string) => !!benefit?.trim())
    };
  }

  private afterMutation(message: string, scholarship: AdminScholarship): void {
    this.actionError = null;
    this.actionMessage = message;
    this.selectedScholarship = scholarship;
    this.mode = 'none';
    this.toast.show(message, { classname: 'bg-success text-light', delay: 3500 });
    this.loadScholarships();
  }

  private applyScholarshipStatus(scholarship: AdminScholarship, desiredStatus: string) {
    if (!scholarship.scholarshipId) return of(scholarship);
    const currentStatus = this.normalizeStatus(scholarship.status);
    const normalizedDesired = this.normalizeStatus(desiredStatus);
    if (normalizedDesired === 'unknown' || normalizedDesired === currentStatus) return of(scholarship);
    if (normalizedDesired === 'published') return this.scholarshipService.publishAdminScholarship(scholarship.scholarshipId);
    if (normalizedDesired === 'draft') return this.scholarshipService.moveAdminScholarshipToDraft(scholarship.scholarshipId);
    if (normalizedDesired === 'closed') return this.scholarshipService.closeAdminScholarship(scholarship.scholarshipId);
    return this.scholarshipService.archiveAdminScholarship(scholarship.scholarshipId);
  }

  private normalizeStatus(status?: string): ScholarshipStatusFilter {
    const normalized = status?.toLowerCase();
    if (normalized === 'draft' || normalized === 'published' || normalized === 'closed' || normalized === 'archived') return normalized;
    return 'unknown';
  }

  private today(): string { return new Date().toISOString().slice(0, 10); }
  private toDateInput(value?: string | null): string { return value ? new Date(value).toISOString().slice(0, 10) : this.today(); }

  private getLoadError(err: any): string {
    if (err?.status === 401) return 'Please sign in again to view scholarships.';
    if (err?.status === 403) return 'You do not have access to view scholarships.';
    return 'Unable to load scholarships right now. Please try again later.';
  }

  private getActionError(err: any, fallback: string): string {
    return err?.error?.message || err?.message || fallback;
  }
}
