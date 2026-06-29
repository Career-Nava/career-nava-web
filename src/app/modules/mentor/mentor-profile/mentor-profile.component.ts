import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { MentorLookupOption, MentorSelfProfile, MentorSelfExperienceInput, UpdateMentorSelfProfileRequest } from '../../../services/mentor/mentor.model';
import { MentorService } from '../../../services/mentor/mentor.service';
import { ToastService } from '../../../services/toast.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-mentor-profile',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './mentor-profile.component.html',
  styleUrl: './mentor-profile.component.scss'
})
export class MentorProfileComponent implements OnInit {
  profile: MentorSelfProfile | null = null;
  loading = true;
  saving = false;
  error: string | null = null;
  saveError: string | null = null;
  saveMessage: string | null = null;

  readonly profileForm = this.fb.group({
    company: [ '' ],
    positionTitle: [ '' ],
    linkedInUrl: [ '' ],
    bio: [ '', [ Validators.maxLength(2000) ] ],
    profilePicture: [ '' ],
    location: [ '' ],
    yearsExperience: [ null as number | null ],
    expertiseIds: [ [] as number[] ],
    disciplineIds: [ [] as number[] ],
    fluencyIds: [ [] as number[] ],
    experiences: this.fb.array<FormGroup>([])
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

  get experiences(): FormArray<FormGroup> {
    return this.profileForm.get('experiences') as FormArray<FormGroup>;
  }

  get canSave(): boolean {
    return !this.loading && !this.saving && this.profileForm.valid;
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
      return 'You can keep refining your profile details here, but mentees cannot discover you until the mentor profile becomes active.';
    }

    return 'Your public mentor visibility is controlled by admins. Profile edits here do not change lifecycle status on their own.';
  }

  get statusBadgeClass(): string {
    return `mentor-profile__status-pill--${ this.statusTone }`;
  }

  trackOption(_: number, option: MentorLookupOption): number {
    return option.id;
  }

  trackExperience(index: number): number {
    return index;
  }

  isSelected(controlName: 'expertiseIds' | 'disciplineIds' | 'fluencyIds', optionId: number): boolean {
    const selected = this.profileForm.get(controlName)?.value as number[] | null;
    return Array.isArray(selected) && selected.includes(optionId);
  }

  toggleSelection(controlName: 'expertiseIds' | 'disciplineIds' | 'fluencyIds', optionId: number, checked: boolean): void {
    const selected = new Set<number>((this.profileForm.get(controlName)?.value as number[] | null) ?? []);
    if (checked) {
      selected.add(optionId);
    } else {
      selected.delete(optionId);
    }

    this.profileForm.get(controlName)?.setValue(Array.from(selected));
    this.profileForm.get(controlName)?.markAsDirty();
  }

  addExperience(): void {
    this.experiences.push(this.createExperienceGroup());
    this.saveMessage = null;
  }

  removeExperience(index: number): void {
    this.experiences.removeAt(index);
    this.saveMessage = null;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.saveError = null;
    this.saveMessage = null;

    this.mentorService.updateSelfProfile(this.buildPayload())
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: profile => {
          this.profile = profile;
          this.populateForm(profile);
          this.saveMessage = 'Profile updated successfully.';
          this.authService.updateUser({ profilePicture: profile.profilePicture ?? undefined, calendlyConnected: profile.calendlyConnected });
          this.toastService.show('Profile updated successfully.', { classname: 'bg-success text-light', delay: 3500 });
        },
        error: err => {
          this.saveError = this.getActionError(err, 'Unable to save your profile right now.');
        }
      });
  }

  private loadProfile(): void {
    this.loading = true;
    this.error = null;

    this.mentorService.getSelfProfile()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: profile => {
          this.profile = profile;
          this.populateForm(profile);
        },
        error: err => {
          this.error = this.getActionError(err, 'Unable to load your mentor profile right now.');
        }
      });
  }

  private populateForm(profile: MentorSelfProfile): void {
    this.profileForm.patchValue({
      company: profile.company ?? '',
      positionTitle: profile.positionTitle ?? '',
      linkedInUrl: profile.linkedInUrl ?? '',
      bio: profile.bio ?? '',
      profilePicture: profile.profilePicture ?? '',
      location: profile.location ?? '',
      yearsExperience: profile.yearsExperience ?? null,
      expertiseIds: (profile.expertise ?? []).map(item => item.expertiseId).filter((value): value is number => typeof value === 'number'),
      disciplineIds: (profile.disciplines ?? []).map(item => item.disciplineId).filter((value): value is number => typeof value === 'number'),
      fluencyIds: (profile.fluency ?? []).map(item => item.fluencyId).filter((value): value is number => typeof value === 'number')
    });

    this.experiences.clear();
    (profile.experiences ?? []).forEach(experience => {
      this.experiences.push(this.createExperienceGroup({
        mentorExperienceId: experience.mentorExperienceId ?? null,
        title: experience.title ?? '',
        description: experience.description ?? '',
        companyName: experience.companyName ?? '',
        companyImage: experience.companyImage ?? '',
        startDate: this.toDateInput(experience.startDate),
        endDate: this.toDateInput(experience.endDate ?? undefined)
      }));
    });

    this.profileForm.markAsPristine();
  }

  private createExperienceGroup(experience?: Partial<MentorSelfExperienceInput>): FormGroup {
    return this.fb.group({
      mentorExperienceId: [ experience?.mentorExperienceId ?? null ],
      title: [ experience?.title ?? '', Validators.required ],
      description: [ experience?.description ?? '', Validators.required ],
      companyName: [ experience?.companyName ?? '' ],
      companyImage: [ experience?.companyImage ?? '' ],
      startDate: [ experience?.startDate ?? '', Validators.required ],
      endDate: [ experience?.endDate ?? '' ]
    });
  }

  private buildPayload(): UpdateMentorSelfProfileRequest {
    const value = this.profileForm.getRawValue();
    return {
      company: this.toNullable(value.company),
      positionTitle: this.toNullable(value.positionTitle),
      linkedInUrl: this.toNullable(value.linkedInUrl),
      bio: this.toNullable(value.bio),
      profilePicture: this.toNullable(value.profilePicture),
      location: this.toNullable(value.location),
      yearsExperience: typeof value.yearsExperience === 'number' ? value.yearsExperience : null,
      expertiseIds: [ ...(value.expertiseIds ?? []) ],
      disciplineIds: [ ...(value.disciplineIds ?? []) ],
      fluencyIds: [ ...(value.fluencyIds ?? []) ],
      experiences: this.experiences.controls.map(control => {
        const experience = control.getRawValue();
        return {
          mentorExperienceId: experience.mentorExperienceId ?? null,
          title: experience.title,
          description: experience.description,
          companyName: this.toNullable(experience.companyName),
          companyImage: this.toNullable(experience.companyImage),
          startDate: experience.startDate,
          endDate: this.toNullable(experience.endDate)
        };
      })
    };
  }

  private toNullable(value: string | null | undefined): string | null {
    return value && value.trim().length ? value.trim() : null;
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
