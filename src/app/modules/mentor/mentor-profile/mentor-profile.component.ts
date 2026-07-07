import { Component, OnInit } from '@angular/core';
import {
  faArrowUpRightFromSquare,
  faCalendarCheck,
  faEye,
  faFloppyDisk,
  faLink,
  faPen,
  faPlus,
  faTrashCan,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import {
  MentorLookupOption,
  MentorSelfExperienceInput,
  MentorSelfProfile,
  MentorSchedulingDetails,
  UpdateMentorSelfProfileRequest
} from '../../../services/mentor/mentor.model';
import { MentorService } from '../../../services/mentor/mentor.service';
import { ToastService } from '../../../services/toast.service';
import { SharedModule } from '../../../shared/shared.module';

type ProfileSectionKey = 'content' | 'taxonomy' | 'experience';
type TaxonomyControlName = 'expertiseIds' | 'disciplineIds' | 'fluencyIds';

@Component({
  selector: 'app-mentor-profile',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './mentor-profile.component.html',
  styleUrl: './mentor-profile.component.scss'
})
export class MentorProfileComponent implements OnInit {
  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  protected readonly faCalendarCheck = faCalendarCheck;
  protected readonly faEye = faEye;
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faLink = faLink;
  protected readonly faPen = faPen;
  protected readonly faPlus = faPlus;
  protected readonly faTrashCan = faTrashCan;
  protected readonly faXmark = faXmark;

  profile: MentorSelfProfile | null = null;
  loading = true;
  error: string | null = null;

  editingContent = false;
  editingTaxonomy = false;
  editingExperienceIndex: number | null = null;
  addingExperience = false;

  readonly sectionSaving: Record<ProfileSectionKey, boolean> = {
    content: false,
    taxonomy: false,
    experience: false
  };

  readonly sectionError: Record<ProfileSectionKey, string | null> = {
    content: null,
    taxonomy: null,
    experience: null
  };

  readonly sectionMessage: Record<ProfileSectionKey, string | null> = {
    content: null,
    taxonomy: null,
    experience: null
  };

  readonly contentForm = this.fb.group({
    company: [ '' ],
    positionTitle: [ '' ],
    linkedInUrl: [ '' ],
    profilePicture: [ '' ],
    location: [ '' ],
    yearsExperience: [ null as number | null ],
    bio: [ '', [ Validators.maxLength(2000) ] ]
  });

  readonly taxonomyForm = this.fb.group({
    expertiseIds: [ [] as number[] ],
    disciplineIds: [ [] as number[] ],
    fluencyIds: [ [] as number[] ]
  });

  readonly experienceForm = this.fb.group({
    mentorExperienceId: [ null as number | null ],
    title: [ '', Validators.required ],
    companyName: [ '' ],
    startDate: [ '', Validators.required ],
    endDate: [ '' ],
    companyImage: [ '' ],
    description: [ '', Validators.required ]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly mentorService: MentorService,
    private readonly toastService: ToastService,
    private readonly authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  get statusLabel(): string {
    return this.profile?.mentorProfileStatus || 'unknown';
  }

  get statusTone(): 'success' | 'warning' | 'danger' | 'muted' {
    const status = (this.profile?.mentorProfileStatus || '').toLowerCase();
    if ((this.profile?.isActive ?? false) && status === 'active') return 'success';
    if (status === 'draft') return 'warning';
    if (status === 'inactive' || status === 'suspended') return 'danger';
    return 'muted';
  }

  get statusBadgeClass(): string {
    if (this.statusTone === 'success') return 'admin-badge--success';
    if (this.statusTone === 'warning') return 'admin-badge--warning';
    if (this.statusTone === 'danger') return 'admin-badge--danger';
    return 'admin-badge--muted';
  }

  get visibilityHeadline(): string {
    const status = (this.profile?.mentorProfileStatus || '').toLowerCase();
    if (!(this.profile?.isActive ?? false)) return 'Your account is inactive';
    if (status === 'active') return 'Your profile is live';
    if (status === 'draft') return 'Your profile is not live yet';
    if (status === 'suspended') return 'Your profile is currently suspended';
    if (status === 'inactive') return 'Your profile is currently not publicly visible';
    return 'Your visibility is still being determined';
  }

  get visibilityCopy(): string {
    const status = (this.profile?.mentorProfileStatus || '').toLowerCase();
    if (!(this.profile?.isActive ?? false)) {
      return 'Mentees cannot discover or book you while the account itself is inactive.';
    }

    if (status === 'active') {
      return 'Mentees can discover your public mentor profile because both the account and mentor profile are active.';
    }

    if (status === 'draft') {
      return 'Keep refining your profile here. Mentees cannot discover you until the mentor profile becomes active.';
    }

    return 'Your public mentor visibility is controlled by admins. Profile edits here do not change lifecycle status on their own.';
  }

  get hasProfile(): boolean {
    return !!this.profile && !this.loading && !this.error;
  }

  get scheduling(): MentorSchedulingDetails | null {
    return this.profile?.scheduling ?? null;
  }

  get schedulingStateLabel(): string {
    if (!this.scheduling) {
      return 'No assigned event type';
    }

    const status = (this.scheduling.activeStatus || '').toLowerCase();
    if (status === 'active') return 'Assigned event type active';
    if (status) return `${ status.charAt(0).toUpperCase() + status.slice(1) } event type`;
    return 'Booking setup configured';
  }

  trackOption(_: number, option: MentorLookupOption): number {
    return option.id;
  }

  trackExperience(index: number): number {
    return index;
  }

  startContentEdit(): void {
    if (!this.profile) return;
    this.clearSectionFeedback('content');
    this.editingContent = true;
    this.contentForm.reset({
      company: this.profile.company ?? '',
      positionTitle: this.profile.positionTitle ?? '',
      linkedInUrl: this.profile.linkedInUrl ?? '',
      profilePicture: this.profile.profilePicture ?? '',
      location: this.profile.location ?? '',
      yearsExperience: this.profile.yearsExperience ?? null,
      bio: this.profile.bio ?? ''
    });
  }

  cancelContentEdit(): void {
    this.editingContent = false;
    this.clearSectionFeedback('content');
    this.contentForm.reset();
  }

  saveContent(): void {
    if (!this.profile) return;
    if (this.contentForm.invalid) {
      this.contentForm.markAllAsTouched();
      return;
    }

    const value = this.contentForm.getRawValue();
    this.saveSection('content', {
      company: this.toNullable(value.company),
      positionTitle: this.toNullable(value.positionTitle),
      linkedInUrl: this.toNullable(value.linkedInUrl),
      profilePicture: this.toNullable(value.profilePicture),
      location: this.toNullable(value.location),
      yearsExperience: this.toNullableNumber(value.yearsExperience),
      bio: this.toNullable(value.bio)
    }, 'Profile content updated.', () => {
      this.editingContent = false;
    });
  }

  startTaxonomyEdit(): void {
    if (!this.profile) return;
    this.clearSectionFeedback('taxonomy');
    this.editingTaxonomy = true;
    this.taxonomyForm.reset({
      expertiseIds: this.getSelectedIds('expertise'),
      disciplineIds: this.getSelectedIds('disciplines'),
      fluencyIds: this.getSelectedIds('fluency')
    });
  }

  cancelTaxonomyEdit(): void {
    this.editingTaxonomy = false;
    this.clearSectionFeedback('taxonomy');
    this.taxonomyForm.reset();
  }

  saveTaxonomy(): void {
    const value = this.taxonomyForm.getRawValue();
    this.saveSection('taxonomy', {
      expertiseIds: [ ...(value.expertiseIds ?? []) ],
      disciplineIds: [ ...(value.disciplineIds ?? []) ],
      fluencyIds: [ ...(value.fluencyIds ?? []) ]
    }, 'Mentoring fit updated.', () => {
      this.editingTaxonomy = false;
    });
  }

  isSelected(controlName: TaxonomyControlName, optionId: number): boolean {
    const selected = this.taxonomyForm.get(controlName)?.value as number[] | null;
    return Array.isArray(selected) && selected.includes(optionId);
  }

  toggleSelection(controlName: TaxonomyControlName, optionId: number): void {
    const selected = new Set<number>((this.taxonomyForm.get(controlName)?.value as number[] | null) ?? []);
    if (selected.has(optionId)) {
      selected.delete(optionId);
    } else {
      selected.add(optionId);
    }

    this.taxonomyForm.get(controlName)?.setValue(Array.from(selected));
    this.taxonomyForm.get(controlName)?.markAsDirty();
  }

  startAddExperience(): void {
    this.clearSectionFeedback('experience');
    this.addingExperience = true;
    this.editingExperienceIndex = null;
    this.experienceForm.reset({
      mentorExperienceId: null,
      title: '',
      companyName: '',
      startDate: '',
      endDate: '',
      companyImage: '',
      description: ''
    });
  }

  startEditExperience(index: number): void {
    if (!this.profile?.experiences?.[index]) return;
    this.clearSectionFeedback('experience');
    this.addingExperience = false;
    this.editingExperienceIndex = index;
    const experience = this.profile.experiences[index];
    this.experienceForm.reset({
      mentorExperienceId: experience.mentorExperienceId ?? null,
      title: experience.title ?? '',
      companyName: experience.companyName ?? '',
      startDate: this.toDateInput(experience.startDate),
      endDate: this.toDateInput(experience.endDate),
      companyImage: experience.companyImage ?? '',
      description: experience.description ?? ''
    });
  }

  cancelExperienceEdit(): void {
    this.addingExperience = false;
    this.editingExperienceIndex = null;
    this.clearSectionFeedback('experience');
    this.experienceForm.reset();
  }

  saveExperience(): void {
    if (!this.profile) return;
    if (this.experienceForm.invalid) {
      this.experienceForm.markAllAsTouched();
      return;
    }

    const draft = this.toExperienceInput(this.experienceForm.getRawValue());
    const nextExperiences = (this.profile.experiences ?? []).map(item => this.toExperienceInput(item));

    if (this.addingExperience) {
      nextExperiences.push(draft);
    } else if (this.editingExperienceIndex != null) {
      nextExperiences[this.editingExperienceIndex] = draft;
    } else {
      return;
    }

    this.saveSection('experience', { experiences: nextExperiences }, this.addingExperience ? 'Experience added.' : 'Experience updated.', () => {
      this.addingExperience = false;
      this.editingExperienceIndex = null;
      this.experienceForm.reset();
    });
  }

  removeExperience(index: number): void {
    if (!this.profile?.experiences?.[index]) return;
    const experience = this.profile.experiences[index];
    const label = experience.title || `experience ${ index + 1 }`;
    if (!window.confirm(`Remove ${ label } from your profile?`)) {
      return;
    }

    const nextExperiences = (this.profile.experiences ?? [])
      .filter((_, currentIndex) => currentIndex !== index)
      .map(item => this.toExperienceInput(item));

    this.saveSection('experience', { experiences: nextExperiences }, 'Experience removed.', () => {
      this.addingExperience = false;
      this.editingExperienceIndex = null;
      this.experienceForm.reset();
    });
  }

  getSelectedPills(group: 'expertise' | 'disciplines' | 'fluency'): string[] {
    if (!this.profile) return [];

    if (group === 'expertise') {
      return (this.profile.expertise ?? []).map(item => item.expertiseName || '').filter(Boolean);
    }

    if (group === 'disciplines') {
      return (this.profile.disciplines ?? []).map(item => item.disciplineName || '').filter(Boolean);
    }

    return (this.profile.fluency ?? []).map(item => item.fluencyName || '').filter(Boolean);
  }

  private loadProfile(): void {
    this.loading = true;
    this.error = null;

    this.mentorService.getSelfProfile()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: profile => {
          this.applyProfile(profile);
        },
        error: err => {
          this.error = this.getActionError(err, 'Unable to load your mentor profile right now.');
        }
      });
  }

  private applyProfile(profile: MentorSelfProfile): void {
    this.profile = profile;
    this.authService.updateUser({ profilePicture: profile.profilePicture ?? undefined });
  }

  private saveSection(
    section: ProfileSectionKey,
    overrides: Partial<UpdateMentorSelfProfileRequest>,
    successMessage: string,
    onSuccess?: () => void
  ): void {
    if (!this.profile) return;

    this.sectionSaving[section] = true;
    this.sectionError[section] = null;
    this.sectionMessage[section] = null;

    this.mentorService.updateSelfProfile(this.buildPayload(overrides))
      .pipe(finalize(() => this.sectionSaving[section] = false))
      .subscribe({
        next: profile => {
          this.applyProfile(profile);
          this.sectionMessage[section] = successMessage;
          onSuccess?.();
          this.toastService.show(successMessage, { classname: 'bg-success text-light', delay: 3200 });
        },
        error: err => {
          this.sectionError[section] = this.getActionError(err, 'Unable to save your profile changes right now.');
        }
      });
  }

  private buildPayload(overrides: Partial<UpdateMentorSelfProfileRequest> = {}): UpdateMentorSelfProfileRequest {
    if (!this.profile) {
      return {
        expertiseIds: [],
        disciplineIds: [],
        fluencyIds: [],
        experiences: []
      };
    }

    const basePayload: UpdateMentorSelfProfileRequest = {
      company: this.toNullable(this.profile.company),
      positionTitle: this.toNullable(this.profile.positionTitle),
      linkedInUrl: this.toNullable(this.profile.linkedInUrl),
      bio: this.toNullable(this.profile.bio),
      profilePicture: this.toNullable(this.profile.profilePicture),
      location: this.toNullable(this.profile.location),
      yearsExperience: typeof this.profile.yearsExperience === 'number' ? this.profile.yearsExperience : null,
      expertiseIds: this.getSelectedIds('expertise'),
      disciplineIds: this.getSelectedIds('disciplines'),
      fluencyIds: this.getSelectedIds('fluency'),
      experiences: (this.profile.experiences ?? []).map(item => this.toExperienceInput(item))
    };

    return {
      ...basePayload,
      ...overrides,
      expertiseIds: overrides.expertiseIds ?? basePayload.expertiseIds,
      disciplineIds: overrides.disciplineIds ?? basePayload.disciplineIds,
      fluencyIds: overrides.fluencyIds ?? basePayload.fluencyIds,
      experiences: overrides.experiences ?? basePayload.experiences
    };
  }

  private getSelectedIds(group: 'expertise' | 'disciplines' | 'fluency'): number[] {
    if (!this.profile) return [];

    if (group === 'expertise') {
      return (this.profile.expertise ?? []).map(item => item.expertiseId).filter((value): value is number => typeof value === 'number');
    }

    if (group === 'disciplines') {
      return (this.profile.disciplines ?? []).map(item => item.disciplineId).filter((value): value is number => typeof value === 'number');
    }

    return (this.profile.fluency ?? []).map(item => item.fluencyId).filter((value): value is number => typeof value === 'number');
  }

  private toExperienceInput(experience: {
    mentorExperienceId?: number | null;
    title?: string | null;
    description?: string | null;
    companyName?: string | null;
    companyImage?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }): MentorSelfExperienceInput {
    return {
      mentorExperienceId: experience.mentorExperienceId ?? null,
      title: experience.title?.trim() || '',
      description: experience.description?.trim() || '',
      companyName: this.toNullable(experience.companyName),
      companyImage: this.toNullable(experience.companyImage),
      startDate: this.toDateInput(experience.startDate),
      endDate: this.toNullable(this.toDateInput(experience.endDate))
    };
  }

  private clearSectionFeedback(section: ProfileSectionKey): void {
    this.sectionError[section] = null;
    this.sectionMessage[section] = null;
  }

  private toNullable(value: string | null | undefined): string | null {
    return value && value.trim().length ? value.trim() : null;
  }

  private toNullableNumber(value: number | string | null | undefined): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private toDateInput(value?: string | null): string {
    return value ? value.slice(0, 10) : '';
  }

  private getActionError(err: any, fallback: string): string {
    if (err?.status === 401) return 'Please sign in again to manage your mentor profile.';
    if (err?.status === 403) return 'You do not have permission to manage this mentor profile.';
    return err?.error?.message || err?.message || fallback;
  }
}
