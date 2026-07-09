import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faCalendarCheck, faEye, faEyeSlash, faFloppyDisk, faKey, faLink, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { CalendlyService } from '../../../services/calendly/calendly.service';
import { ToastService } from '../../../services/toast.service';
import { ChangePasswordRequest, SetupPasswordRequest, UpdateUserProfileRequest, UserProfile, UserSecurityStatus } from '../../../services/user/user.model';
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
  protected readonly faEye = faEye;
  protected readonly faEyeSlash = faEyeSlash;
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faKey = faKey;
  protected readonly faLink = faLink;
  protected readonly faRotateRight = faRotateRight;

  profile: UserProfile | null = null;
  securityStatus: UserSecurityStatus | null = null;
  loading = true;
  saving = false;
  changingPassword = false;
  error: string | null = null;
  message: string | null = null;
  passwordError: string | null = null;
  passwordMessage: string | null = null;
  setupPasswordError: string | null = null;
  setupPasswordMessage: string | null = null;
  settingUpPassword = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  showSetupNewPassword = false;
  showSetupConfirmPassword = false;

  readonly profileForm = this.fb.group({
    fullName: [ '', [ Validators.required, Validators.maxLength(150) ] ],
    profilePicture: [ '', [ Validators.maxLength(2048) ] ]
  });

  readonly passwordForm = this.fb.group({
    currentPassword: [ '', [ Validators.required ] ],
    newPassword: [ '', [ Validators.required, Validators.minLength(6), Validators.maxLength(200) ] ],
    confirmPassword: [ '', [ Validators.required ] ]
  }, { validators: [ AccountProfileComponent.passwordMatchValidator ] });

  readonly setupPasswordForm = this.fb.group({
    newPassword: [ '', [ Validators.required, Validators.minLength(6), Validators.maxLength(200) ] ],
    confirmPassword: [ '', [ Validators.required ] ]
  }, { validators: [ AccountProfileComponent.passwordMatchValidator ] });

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

  get googleLinked(): boolean {
    if (this.securityStatus) return this.securityStatus.googleLinked;
    return this.profile?.googleLinked ?? false;
  }

  get showChangePasswordForm(): boolean {
    return this.securityStatus?.hasLocalPassword ?? false;
  }

  get showSetupPasswordForm(): boolean {
    return this.securityStatus?.canSetupPassword ?? false;
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

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const value = this.passwordForm.getRawValue();
    const payload: ChangePasswordRequest = {
      currentPassword: value.currentPassword ?? '',
      newPassword: value.newPassword ?? '',
      confirmPassword: value.confirmPassword ?? ''
    };

    this.changingPassword = true;
    this.passwordError = null;
    this.passwordMessage = null;

    this.userService.changeCurrentPassword(payload)
      .pipe(finalize(() => this.changingPassword = false))
      .subscribe({
        next: () => {
          this.resetPasswordVisibility();
          this.passwordForm.reset({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          this.passwordMessage = 'Password changed.';
          this.toast.show('Password changed.', { classname: 'bg-success text-light', delay: 3200 });
        },
        error: err => {
          this.passwordError = this.getActionError(err, 'Unable to change your password right now.');
        }
      });
  }

  setupPassword(): void {
    if (this.setupPasswordForm.invalid) {
      this.setupPasswordForm.markAllAsTouched();
      return;
    }

    const value = this.setupPasswordForm.getRawValue();
    const payload: SetupPasswordRequest = {
      newPassword: value.newPassword ?? '',
      confirmPassword: value.confirmPassword ?? ''
    };

    this.settingUpPassword = true;
    this.setupPasswordError = null;
    this.setupPasswordMessage = null;

    this.userService.setupCurrentPassword(payload)
      .pipe(finalize(() => this.settingUpPassword = false))
      .subscribe({
        next: () => {
          this.resetSetupPasswordVisibility();
          this.setupPasswordForm.reset({
            newPassword: '',
            confirmPassword: ''
          });
          this.setupPasswordMessage = 'Password set.';
          this.toast.show('Password set.', { classname: 'bg-success text-light', delay: 3200 });
          this.refreshSecurityStatus();
        },
        error: err => {
          this.setupPasswordError = this.getActionError(err, 'Unable to set your password right now.');
        }
      });
  }

  private loadProfile(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      profile: this.userService.getCurrentProfile(),
      securityStatus: this.userService.getCurrentSecurityStatus()
    })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: ({ profile, securityStatus }) => {
          this.securityStatus = securityStatus;
          this.applyProfile(profile);
        },
        error: err => {
          this.error = this.getActionError(err, 'Unable to load your profile right now.');
        }
      });
  }

  private refreshSecurityStatus(): void {
    this.userService.getCurrentSecurityStatus().subscribe({
      next: securityStatus => {
        this.securityStatus = securityStatus;
      },
      error: () => undefined
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

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
      return;
    }

    if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
      return;
    }

    this.showConfirmPassword = !this.showConfirmPassword;
  }

  toggleSetupPasswordVisibility(field: 'new' | 'confirm'): void {
    if (field === 'new') {
      this.showSetupNewPassword = !this.showSetupNewPassword;
      return;
    }

    this.showSetupConfirmPassword = !this.showSetupConfirmPassword;
  }

  private getActionError(err: any, fallback: string): string {
    if (err?.status === 401) return 'Please sign in again to manage your profile.';
    if (err?.status === 403) return 'You do not have permission to manage this profile.';
    return err?.error?.message || err?.message || fallback;
  }

  private resetPasswordVisibility(): void {
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  private resetSetupPasswordVisibility(): void {
    this.showSetupNewPassword = false;
    this.showSetupConfirmPassword = false;
  }

  private static passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) return null;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }
}
