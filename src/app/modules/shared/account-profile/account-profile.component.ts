import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faCalendarCheck, faFloppyDisk, faLink, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { finalize, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { CalendlyService } from '../../../services/calendly/calendly.service';
import { ToastService } from '../../../services/toast.service';
import { UpdateUserProfileRequest, UserProfile } from '../../../services/user/user.model';
import { UserService } from '../../../services/user/user.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './account-profile.component.html',
  styleUrl: './account-profile.component.scss'
})
export class AccountProfileComponent implements OnInit, OnDestroy {
  protected readonly faCalendarCheck = faCalendarCheck;
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faLink = faLink;
  protected readonly faRotateRight = faRotateRight;

  profile: UserProfile | null = null;
  loading = true;
  saving = false;
  error: string | null = null;
  message: string | null = null;

  readonly profileForm = this.fb.group({
    fullName: [ '', [ Validators.required, Validators.maxLength(150) ] ],
    profilePicture: [ '', [ Validators.maxLength(2048) ] ]
  });

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly calendlyService: CalendlyService,
    private readonly toast: ToastService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.handleCalendlyRedirect();
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get canManageCalendly(): boolean {
    return this.profile?.role === 'admin';
  }

  get calendlyStatusLabel(): string {
    if (!this.canManageCalendly) return 'Not applicable';
    return this.profile?.calendlyConnected ? 'Calendly connected' : 'Calendly not connected';
  }

  get calendlyStatusClass(): string {
    if (!this.canManageCalendly) return 'admin-badge--muted';
    return this.profile?.calendlyConnected ? 'admin-badge--success' : 'admin-badge--warning';
  }

  connectCalendly(): void {
    if (!this.profile || !this.canManageCalendly) return;
    window.location.href = this.calendlyService.getConnectUrl(this.profile.userId);
  }

  refreshProfile(): void {
    this.loadProfile();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const value = this.profileForm.getRawValue();
    const payload: UpdateUserProfileRequest = {
      fullName: value.fullName?.trim() ?? '',
      profilePicture: this.toNullable(value.profilePicture)
    };

    this.saving = true;
    this.error = null;
    this.message = null;

    this.userService.updateCurrentProfile(payload)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: profile => {
          this.applyProfile(profile);
          this.message = 'Profile updated.';
          this.authService.updateUser({
            fullName: profile.fullName,
            profilePicture: profile.profilePicture ?? undefined,
            calendlyConnected: profile.calendlyConnected
          });
          this.toast.show('Profile updated.', { classname: 'bg-success text-light', delay: 3200 });
        },
        error: err => {
          this.error = this.getActionError(err, 'Unable to save your profile right now.');
        }
      });
  }

  private loadProfile(): void {
    this.loading = true;
    this.error = null;

    this.userService.getCurrentProfile()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: profile => this.applyProfile(profile),
        error: err => {
          this.error = this.getActionError(err, 'Unable to load your profile right now.');
        }
      });
  }

  private applyProfile(profile: UserProfile): void {
    this.profile = profile;
    this.profileForm.reset({
      fullName: profile.fullName ?? '',
      profilePicture: profile.profilePicture ?? ''
    });
  }

  private handleCalendlyRedirect(): void {
    if (!this.router.url.startsWith('/admin/profile')) return;

    const queryParams = this.route.snapshot.queryParamMap;
    const calendlyStatus = queryParams.get('calendly');
    const legacyStatus = queryParams.get('status');
    const message = queryParams.get('message');

    if (!calendlyStatus && !legacyStatus) return;

    if (calendlyStatus === 'connected' || legacyStatus === 'success') {
      this.toast.show('Calendly linked successfully.', { classname: 'bg-success text-light', delay: 5000 });
      this.authService.updateUser({ calendlyConnected: true });
      this.subscriptions.add(this.authService.refreshCurrentUser().subscribe({ error: () => undefined }));
    } else {
      this.toast.show(`Unable to link Calendly${ message ? ': ' + message : '.' }`, { classname: 'bg-danger text-light', delay: 7000 });
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  private toNullable(value: string | null | undefined): string | null {
    return value && value.trim().length ? value.trim() : null;
  }

  private getActionError(err: any, fallback: string): string {
    if (err?.status === 401) return 'Please sign in again to manage your profile.';
    if (err?.status === 403) return 'You do not have permission to manage this profile.';
    return err?.error?.message || err?.message || fallback;
  }
}
