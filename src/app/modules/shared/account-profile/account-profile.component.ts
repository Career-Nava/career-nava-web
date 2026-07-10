import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faCalendarCheck, faEye, faEyeSlash, faFloppyDisk, faKey, faLink, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { finalize, forkJoin, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { CalendlyService } from '../../../services/calendly/calendly.service';
import { ToastService } from '../../../services/toast.service';
import { getUserErrorMessage } from '../../../services/user-error-message';
import { ChangePasswordRequest, GoogleUnlinkRequest, SetupPasswordRequest, UpdateUserProfileRequest, UserProfile, UserSecurityStatus } from '../../../services/user/user.model';
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
  settingUpPassword = false;
  linkingGoogle = false;
  unlinkingGoogle = false;
  showingGoogleUnlinkConfirmation = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  showSetupNewPassword = false;
  showSetupConfirmPassword = false;
  showUnlinkCurrentPassword = false;

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

  readonly unlinkGoogleForm = this.fb.group({
    currentPassword: [ '', [ Validators.required ] ]
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
    this.handleGoogleLinkRedirect();
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

  get calendlyStatusBadgeLabel(): string {
    if (!this.canManageCalendly) return 'Unavailable';
    return this.profile?.calendlyConnected ? 'Connected' : 'Unconnected';
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

  get showGoogleUnlinkSection(): boolean {
    return this.securityStatus?.canUnlinkGoogle ?? false;
  }

  get showGoogleLinkAction(): boolean {
    return this.securityStatus?.canLinkGoogle ?? false;
  }

  get canSubmitGoogleUnlink(): boolean {
    const currentPassword = this.unlinkGoogleForm.get('currentPassword')?.value;
    return !this.unlinkingGoogle && typeof currentPassword === 'string' && currentPassword.trim().length > 0;
  }

  get googleCardLabel(): string {
    return this.googleLinked ? 'Connected account' : 'Sign-in method';
  }

  get showGoogleCardIntro(): boolean {
    return this.showGoogleUnlinkSection || this.showGoogleLinkAction;
  }

  get googleCardIntro(): string {
    if (this.showGoogleLinkAction) {
      return 'Connect Google so you can use it as a sign-in method for this Career Nava account.';
    }

    return 'You can disconnect Google because your account also has a local password. You will still be able to sign in with email and password.';
  }

  get googleCardNotice(): string {
    if (this.googleLinked) {
      return this.securityStatus?.googleUnlinkBlockedReason || 'Google cannot be disconnected until this account also has a local password.';
    }

    return this.securityStatus?.googleLinkBlockedReason || '';
  }

  get showGoogleReadOnlyNote(): boolean {
    return !this.showGoogleUnlinkSection && !this.showGoogleLinkAction && this.googleCardNotice.trim().length > 0;
  }

  linkGoogle(): void {
    this.linkingGoogle = true;

    this.authService.getGoogleLinkAuthorizationUrl()
      .pipe(finalize(() => this.linkingGoogle = false))
      .subscribe({
        next: authorizationUrl => {
          window.location.href = authorizationUrl;
        },
        error: err => {
          this.toast.error(getUserErrorMessage(err, 'Unable to start Google linking right now.'), { title: 'Google linking failed' });
        }
      });
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

    this.userService.updateCurrentProfile(payload)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: profile => {
          this.applyProfile(profile);
          this.authService.updateUser({
            fullName: profile.fullName,
            profilePicture: profile.profilePicture ?? undefined,
            calendlyConnected: profile.calendlyConnected
          });
          this.toast.success('Profile updated.', { title: 'Profile saved' });
        },
        error: err => {
          this.toast.error(getUserErrorMessage(err, 'Unable to save your profile right now.'), { title: 'Profile save failed' });
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
          this.toast.success('Password changed.', { title: 'Password updated' });
        },
        error: err => {
          this.toast.error(getUserErrorMessage(err, 'Unable to change your password right now.'), { title: 'Password update failed' });
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

    this.userService.setupCurrentPassword(payload)
      .pipe(finalize(() => this.settingUpPassword = false))
      .subscribe({
        next: () => {
          this.resetSetupPasswordVisibility();
          this.setupPasswordForm.reset({
            newPassword: '',
            confirmPassword: ''
          });
          this.toast.success('Password set.', { title: 'Password ready' });
          this.refreshSecurityStatus();
        },
        error: err => {
          this.toast.error(getUserErrorMessage(err, 'Unable to set your password right now.'), { title: 'Password setup failed' });
        }
      });
  }

  unlinkGoogle(): void {
    if (this.unlinkGoogleForm.invalid) {
      this.unlinkGoogleForm.markAllAsTouched();
      return;
    }

    const value = this.unlinkGoogleForm.getRawValue();
    const payload: GoogleUnlinkRequest = {
      currentPassword: value.currentPassword ?? ''
    };

    this.unlinkingGoogle = true;

    this.userService.unlinkCurrentGoogle(payload)
      .pipe(finalize(() => this.unlinkingGoogle = false))
      .subscribe({
        next: () => {
          this.showUnlinkCurrentPassword = false;
          this.unlinkGoogleForm.reset({
            currentPassword: ''
          });
          this.toast.success('Google sign-in disconnected.', { title: 'Google sign-in removed' });
          this.refreshAccountState();
        },
        error: err => {
          this.toast.error(getUserErrorMessage(err, 'Unable to disconnect Google sign-in right now.'), { title: 'Google disconnect failed' });
        }
      });
  }

  beginGoogleUnlink(): void {
    this.showingGoogleUnlinkConfirmation = true;
    this.showUnlinkCurrentPassword = false;
    this.unlinkGoogleForm.reset({
      currentPassword: ''
    });
  }

  cancelGoogleUnlink(): void {
    this.showingGoogleUnlinkConfirmation = false;
    this.showUnlinkCurrentPassword = false;
    this.unlinkGoogleForm.reset({
      currentPassword: ''
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
          this.error = getUserErrorMessage(err, 'Unable to load your profile right now.');
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

  private refreshAccountState(): void {
    forkJoin({
      profile: this.userService.getCurrentProfile(),
      securityStatus: this.userService.getCurrentSecurityStatus()
    }).subscribe({
      next: ({ profile, securityStatus }) => {
        this.securityStatus = securityStatus;
        this.applyProfile(profile);
        if (!securityStatus.canUnlinkGoogle) {
          this.showingGoogleUnlinkConfirmation = false;
          this.showUnlinkCurrentPassword = false;
          this.unlinkGoogleForm.reset({
            currentPassword: ''
          });
        }
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
      this.toast.success('Calendly linked successfully.', { title: 'Calendly connected' });
      this.authService.updateUser({ calendlyConnected: true });
      this.subscriptions.add(this.authService.refreshCurrentUser().subscribe({ error: () => undefined }));
    } else {
      this.toast.error('Unable to link Calendly. Please try again later.', { title: 'Calendly connection failed' });
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  private handleGoogleLinkRedirect(): void {
    const queryParams = this.route.snapshot.queryParamMap;
    const googleLinkResult = queryParams.get('googleLink');
    if (!googleLinkResult) return;

    const message = this.getGoogleLinkResultMessage(googleLinkResult);
    if (message.success) {
      this.toast.success(message.text, { title: 'Google linking complete' });
      this.subscriptions.add(this.authService.refreshCurrentUser().subscribe({ error: () => undefined }));
    } else {
      this.toast.error(message.text, { title: 'Google linking failed' });
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
  }

  private getGoogleLinkResultMessage(result: string): { success: boolean; text: string } {
    switch (result) {
      case 'success':
        return { success: true, text: 'Google sign-in linked.' };
      case 'already-linked':
        return { success: true, text: 'Google sign-in is already linked.' };
      case 'conflict':
        return { success: false, text: 'That Google account cannot be linked here.' };
      case 'already-different':
        return { success: false, text: 'This account is already linked to a different Google sign-in.' };
      case 'invalid':
        return { success: false, text: 'Google linking request expired or could not be verified.' };
      default:
        return { success: false, text: 'Unable to link Google sign-in right now.' };
    }
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

  toggleUnlinkPasswordVisibility(): void {
    this.showUnlinkCurrentPassword = !this.showUnlinkCurrentPassword;
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
