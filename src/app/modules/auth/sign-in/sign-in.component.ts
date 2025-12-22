import { AfterViewInit, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { LoginRequest } from "../../../services/auth/auth.model";
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

  isGoogleSignInAvailable: boolean = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private config: ConfigurationService
  ) {
  }

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      email: [ '', [ Validators.required, Validators.email ] ],
      password: [ '', [ Validators.required, Validators.minLength(6) ] ]
    });

    // already logged in
    const existingUser = this.authService.getUser();
    if (existingUser) {
      this.navigateByRole(existingUser.role);
      return;
    }

    // OAuth redirect handling
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      const user = this.authService.restoreSessionFromToken(token);
      this.navigateByRole(user.role);
    }
  }

  ngAfterViewInit(): void {
    const user = this.authService.getUser();
    if (user) this.navigateByRole(user.role);
  }

  onGoogleSignIn(): void {
    window.location.href = this.authService.getGoogleConnectUrl();
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
