import { AfterViewInit, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { GoogleAuthRequest, LoginRequest } from "../../../services/auth/auth.model";
import { AuthService } from "../../../services/auth/auth.service";
import { ConfigurationService } from "../../../services/configuration.service";
import { SharedModule } from "../../../shared/shared.module";

declare const google: any;

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './sign-in.component.html',
  styleUrls: [ './sign-in.component.scss' ]
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
    const user = this.authService.getUser();
    if (user) this.navigateByRole(user.role);

    this.signInForm = this.fb.group({
      email: [ '', [ Validators.required, Validators.email ] ],
      password: [ '', [ Validators.required, Validators.minLength(6) ] ]
    });

    const apiConfig: any = this.config.get<any>('api');
    this.googleClientId = apiConfig?.googleClientId;
  }

  ngAfterViewInit(): void {
    const user = this.authService.getUser();
    if (user) this.navigateByRole(user.role);

    if (!this.googleClientId) return;

    if (typeof google === 'undefined' || !google?.accounts?.id) {
      setTimeout(() => this.initGoogleSDK(), 1000);
    } else {
      this.initGoogleSDK();
    }
  }

  private initGoogleSDK(): void {
    if (!this.googleClientId || typeof google === 'undefined' || !google.accounts?.id) return;

    google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: (response: any) => this.handleGoogleCredentialResponse(response),
      ux_mode: 'popup'
    });
  }

  async onGoogleSignIn(): Promise<void> {
    if (!this.googleClientId || typeof google === 'undefined' || !google?.accounts?.id) return;

    try {
      google.accounts.id.prompt();
    } catch (err) {
      this.errorMessage = 'Google sign-in failed to start.';
      console.error(err);
    }
  }

  private handleGoogleCredentialResponse(response: any): void {
    const idToken = response?.credential;
    if (!idToken) {
      this.errorMessage = 'Failed to obtain Google token.';
      return;
    }

    this.loading = true;
    const payload: GoogleAuthRequest = { idToken };

    this.authService.googleLogin(payload).subscribe({
      next: (res) => {
        // session already saved inside authService
        this.navigateByRole(res.user.role);
        this.loading = false;
      },
      error: (err) => {
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

    this.loading = true;
    const payload: LoginRequest = { email: this.email.value, password: this.password.value };

    this.authService.login(payload).subscribe({
      next: (res) => {
        // session already saved inside authService
        this.navigateByRole(res.user.role);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }

  private navigateByRole(role: string | undefined): void {
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

  get email() {
    return this.signInForm.get('email')!;
  }

  get password() {
    return this.signInForm.get('password')!;
  }
}
