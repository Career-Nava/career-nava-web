import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faEye, faFilter, faFloppyDisk, faPen, faPlus, faRotateRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import { finalize, of, switchMap } from 'rxjs';
import { AdminMentor, EligibleMentorUser } from '../../../services/mentor/mentor.model';
import { MentorService } from '../../../services/mentor/mentor.service';
import { ToastService } from '../../../services/toast.service';
import { SharedModule } from '../../../shared/shared.module';

type MentorStatusFilter = 'all' | 'draft' | 'active' | 'inactive' | 'suspended' | 'unknown';
type MentorMode = 'none' | 'detail' | 'edit' | 'onboard';

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
  protected readonly faFilter = faFilter;
  protected readonly faPen = faPen;
  protected readonly faRotateRight = faRotateRight;
  protected readonly faXmark = faXmark;
  protected readonly faFloppyDisk = faFloppyDisk;

  readonly mentorStatuses = [ 'draft', 'active', 'inactive', 'suspended' ];

  mentors: AdminMentor[] = [];
  eligibleUsers: EligibleMentorUser[] = [];
  selectedMentor: AdminMentor | null = null;
  loading = true;
  loadingEligible = false;
  saving = false;
  error: string | null = null;
  actionError: string | null = null;
  actionMessage: string | null = null;
  mode: MentorMode = 'none';

  searchQuery = '';
  statusFilter: MentorStatusFilter = 'all';
  filtersExpanded = false;

  mentorForm: FormGroup = this.fb.group({
    fullName: [ '', Validators.required ],
    email: [ '', [ Validators.required, Validators.email ] ],
    profilePicture: [ '' ],
    bio: [ '' ],
    location: [ '' ],
    company: [ '' ],
    positionTitle: [ '' ],
    linkedInUrl: [ '' ],
    yearsExperience: [ null ],
    verified: [ false ],
    status: [ 'draft', Validators.required ]
  });

  onboardingForm: FormGroup = this.fb.group({
    userId: [ null, Validators.required ],
    status: [ 'draft', Validators.required ],
    verified: [ false ],
    company: [ '' ],
    positionTitle: [ '' ],
    linkedInUrl: [ '' ],
    bio: [ '' ]
  });

  constructor(
    private mentorService: MentorService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
  }

  ngOnInit(): void {
    this.loadMentors();
  }

  loadMentors(): void {
    this.loading = true;
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
      if (this.statusFilter !== 'all' && status !== this.statusFilter) return false;
      if (!query) return true;

      return [ mentor.fullName, mentor.email, mentor.company, mentor.title, mentor.mentorProfileStatus ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }

  get totalMentors(): number {
    return this.mentors.length;
  }

  get activeMentors(): number {
    return this.mentors.filter(mentor => this.getNormalizedStatus(mentor) === 'active').length;
  }

  get inactiveMentors(): number {
    return this.mentors.filter(mentor => [ 'inactive', 'suspended', 'draft' ].includes(this.getNormalizedStatus(mentor))).length;
  }

  get filteredCount(): number {
    return this.filteredMentors.length;
  }

  get showClearFilters(): boolean {
    return this.filtersExpanded || !!this.searchQuery.trim() || this.statusFilter !== 'all';
  }

  trackMentor(index: number, mentor: AdminMentor): number | string {
    return mentor.mentorId ?? mentor.mentorProfileId ?? mentor.userId ?? mentor.email ?? index;
  }

  trackEligible(_: number, user: EligibleMentorUser): number {
    return user.userId;
  }

  onSearch(value: string): void {
    this.searchQuery = value;
  }

  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }

  onStatusChange(value: string): void {
    this.statusFilter = value as MentorStatusFilter;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
  }

  openOnboarding(): void {
    this.mode = 'onboard';
    this.selectedMentor = null;
    this.actionError = null;
    this.actionMessage = null;
    this.onboardingForm.reset({ status: 'draft', verified: false });
    this.loadEligibleUsers();
  }

  viewMentor(mentor: AdminMentor): void {
    const id = this.getMentorRouteId(mentor);
    if (!id) return;
    this.mode = 'detail';
    this.actionError = null;
    this.mentorService.getAdminMentorById(id).subscribe({
      next: detail => this.selectedMentor = detail,
      error: err => this.actionError = this.getActionError(err, 'Unable to load mentor detail.')
    });
  }

  editMentor(mentor: AdminMentor): void {
    this.viewMentor(mentor);
    this.mode = 'edit';
    this.mentorForm.patchValue({
      fullName: mentor.fullName ?? '',
      email: mentor.email ?? '',
      profilePicture: mentor.profilePicture ?? '',
      bio: mentor.bio ?? '',
      location: mentor.location ?? '',
      company: mentor.company ?? '',
      positionTitle: mentor.positionTitle ?? mentor.title ?? '',
      linkedInUrl: mentor.linkedInUrl ?? mentor.linkedIn ?? '',
      yearsExperience: mentor.yearsExperience ?? null,
      verified: mentor.verified === true,
      status: this.getNormalizedStatus(mentor) === 'unknown' ? 'draft' : this.getNormalizedStatus(mentor)
    });
  }

  saveMentor(): void {
    if (!this.selectedMentor || this.mentorForm.invalid) {
      this.mentorForm.markAllAsTouched();
      return;
    }

    const id = this.getMentorRouteId(this.selectedMentor);
    if (!id) return;
    this.saving = true;
    const { status, ...profilePayload } = this.mentorForm.value;

    this.mentorService.updateAdminMentor(id, profilePayload)
      .pipe(
        switchMap(mentor => {
          const currentStatus = this.getNormalizedStatus(this.selectedMentor!);
          return status && status !== currentStatus
            ? this.mentorService.updateAdminMentorStatus(id, status)
            : of(mentor);
        }),
        finalize(() => this.saving = false)
      )
      .subscribe({
        next: mentor => this.afterMutation('Mentor updated.', mentor),
        error: err => this.actionError = this.getActionError(err, 'Unable to update mentor.')
      });
  }

  onboardUser(): void {
    if (this.onboardingForm.invalid) {
      this.onboardingForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.mentorService.onboardExistingUser(this.onboardingForm.value)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: mentor => {
          this.afterMutation('User promoted to mentor.', mentor);
          this.loadEligibleUsers();
        },
        error: err => this.actionError = this.getActionError(err, 'Unable to onboard mentor.')
      });
  }

  updateMentorStatus(mentor: AdminMentor, status: string): void {
    const id = this.getMentorRouteId(mentor);
    if (!id || !confirm(`Move this mentor profile to ${ status }? Account access is unchanged.`)) return;

    this.saving = true;
    this.mentorService.updateAdminMentorStatus(id, status)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: updated => this.afterMutation(`Mentor status changed to ${ status }.`, updated),
        error: err => this.actionError = this.getActionError(err, 'Unable to change mentor status.')
      });
  }

  closePanel(): void {
    this.mode = 'none';
    this.selectedMentor = null;
    this.actionError = null;
    this.actionMessage = null;
  }

  getStatusLabel(mentor: AdminMentor): string {
    return mentor.mentorProfileStatus || (mentor.isActive ? 'active' : 'inactive');
  }

  getStatusBadgeClass(mentor: AdminMentor): string {
    const status = this.getNormalizedStatus(mentor);
    if (status === 'active') return 'admin-badge--success';
    if (status === 'suspended') return 'admin-badge--danger';
    if (status === 'draft') return 'admin-badge--warning';
    if (status === 'inactive') return 'admin-badge--muted';
    return 'admin-badge--warning';
  }

  getCalendlyLabel(mentor: AdminMentor): string {
    return mentor.calendlyConnected ? 'Connected' : 'Not connected';
  }

  getTitleCompany(mentor: AdminMentor): string {
    const parts = [ mentor.positionTitle ?? mentor.title, mentor.company ].filter(Boolean);
    return parts.length ? parts.join(' / ') : '-';
  }

  getReviewsSummary(mentor: AdminMentor): string {
    return typeof mentor.rating === 'number' ? `${ mentor.rating.toFixed(1) } (${ mentor.totalReviews ?? 0 })` : '-';
  }

  canPreviewMentor(mentor: AdminMentor): boolean {
    return !!this.getMentorPreviewId(mentor);
  }

  getEmptyTitle(): string {
    return this.searchQuery || this.statusFilter !== 'all' ? 'No mentors match the current filters' : 'No mentors found';
  }

  getEmptyMessage(): string {
    return this.searchQuery || this.statusFilter !== 'all'
      ? 'Try a broader search or switch back to all statuses.'
      : 'Mentor records will appear here once users are onboarded as mentors.';
  }

  private loadEligibleUsers(): void {
    this.loadingEligible = true;
    this.mentorService.getEligibleMentorUsers()
      .pipe(finalize(() => this.loadingEligible = false))
      .subscribe({
        next: users => this.eligibleUsers = users,
        error: err => this.actionError = this.getActionError(err, 'Unable to load eligible users.')
      });
  }

  private afterMutation(message: string, mentor: AdminMentor): void {
    this.actionError = null;
    this.actionMessage = message;
    this.toast.show(message, { classname: 'bg-success text-light', delay: 3500 });
    this.selectedMentor = mentor;
    this.mode = 'detail';
    this.loadMentors();
  }

  getMentorRouteId(mentor: AdminMentor): number | null {
    return mentor.mentorProfileId ?? mentor.mentorId ?? mentor.userId ?? null;
  }

  getMentorPreviewId(mentor: AdminMentor): number | null {
    return mentor.userId ?? mentor.mentorId ?? null;
  }

  private getNormalizedStatus(mentor: AdminMentor): MentorStatusFilter {
    const status = mentor.mentorProfileStatus?.toLowerCase();
    if (status === 'draft' || status === 'active' || status === 'inactive' || status === 'suspended') return status;
    if (mentor.isActive === true) return 'active';
    if (mentor.isActive === false) return 'inactive';
    return 'unknown';
  }

  private getMentorLoadError(err: any): string {
    if (err?.status === 401) return 'Please sign in again to view mentors.';
    if (err?.status === 403) return 'You do not have access to view mentors.';
    return 'Unable to load mentors right now. Please try again later.';
  }

  private getActionError(err: any, fallback: string): string {
    return err?.error?.message || err?.message || fallback;
  }
}
