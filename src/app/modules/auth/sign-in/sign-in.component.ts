import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { GoogleAuthRequest, LoginRequest } from "../../../services/auth/auth.model";
import { AuthService } from "../../../services/auth/auth.service";
import { ConfigurationService } from "../../../services/configuration.service";
import { SharedModule } from '../../../shared/shared/shared.module';

declare const google: any;

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit, AfterViewInit {

  signInForm!: FormGroup;
  loading = false;
  errorMessage = '';

  private googleClientId?: string;
  isGoogleSignInAvailable: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private config: ConfigurationService
  ) {
  }

  ngOnInit(): void {
    console.log('[SignInComponent] ngOnInit');

    const user = this.authService.getUser();
    console.log('[SignInComponent] user:', user);

    if (user) {
      this.navigateByRole(user.role);
    }

    this.signInForm = this.fb.group({
      email: [ '', [ Validators.required, Validators.email ] ],
      password: [ '', [ Validators.required, Validators.minLength(6) ] ]
    });

    const apiConfig: any = this.config.get<any>('api');
    this.googleClientId = apiConfig?.googleClientId;
    console.log('[SignInComponent] googleClientId:', this.googleClientId);
  }

  ngAfterViewInit(): void {
    console.log('[SignInComponent] ngAfterViewInit');

    const user = this.authService.getUser();
    if (user) {
      this.navigateByRole(user.role);
    }

    if (!this.googleClientId) {
      console.warn('[SignInComponent] Google Client ID missing');
      return;
    }

    if (typeof google === 'undefined' || !google?.accounts?.id) {
      console.warn('[SignInComponent] Google SDK not ready, retrying...');
      setTimeout(() => this.initGoogleSDK(), 1000);
    } else {
      this.initGoogleSDK();
    }
  }

  private initGoogleSDK() {
    console.log('[GoogleSDK] Initializing...');

    try {
      if (!this.googleClientId) {
        console.error('[GoogleSDK] Missing Google Client ID');
        return;
      }

      if (typeof google === 'undefined' || !google.accounts?.id) {
        console.warn('[GoogleSDK] SDK not loaded yet');
        return;
      }

      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (response: any) => this.handleGoogleCredentialResponse(response),
        ux_mode: 'popup'
      });

      console.log('[GoogleSDK] Initialized successfully');
    } catch (err) {
      console.error('[GoogleSDK] Initialization failed:', err);
    }
  }

  async onGoogleSignIn() {
    if (!this.googleClientId) {
      this.errorMessage = 'Google sign-in not configured.';
      console.error('[GoogleSDK] No client ID configured');
      return;
    }

    if (typeof google === 'undefined' || !google?.accounts?.id) {
      this.errorMessage = 'Google SDK not loaded yet.';
      console.error('[GoogleSDK] SDK not loaded');
      return;
    }

    try {
      google.accounts.id.prompt();
    } catch (err) {
      console.error('[GoogleSDK] Prompt failed:', err);
      this.errorMessage = 'Google sign-in failed to start.';
    }
  }

  private handleGoogleCredentialResponse(response: any) {
    const idToken = response?.credential;
    if (!idToken) {
      console.error('[GoogleSDK] Missing ID token');
      this.errorMessage = 'Failed to obtain Google token.';
      return;
    }

    this.loading = true;
    const payload: GoogleAuthRequest = { idToken };

    this.authService.googleLogin(payload).subscribe({
      next: (res: any) => {
        console.log('[AuthService] Google login success');
        this.authService.saveSession(res.token, res.user);
        this.navigateByRole(res.user.role);
        this.loading = false;
      },
      error: (err) => {
        console.error('[AuthService] Google login failed:', err);
        this.errorMessage = err?.error?.message || 'Google login failed.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    const payload: LoginRequest = { email: this.email.value, password: this.password.value };

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(payload).subscribe({
      next: (res: any) => {
        this.authService.saveSession(res.token, res.user);
        this.navigateByRole(res.user.role);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }

  private navigateByRole(role: string | undefined) {
    switch (role) {
      case 'mentor':
        void this.router.navigate([ '/teacher/overview' ]);
        break;
      case 'admin':
        void this.router.navigate([ '/admin/overview' ]);
        break;
      case 'mentee':
      default:
        void this.router.navigate([ '/mentee/mentors' ]);
        break;
    }
  }

  // convenience getters for template
  get email() {
    return this.signInForm.get('email')!;
  }

  get password() {
    return this.signInForm.get('password')!;
  }
}
