import { AfterViewInit, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { LoginRequest } from "../../../services/auth/auth.model";
import { AuthService } from "../../../services/auth/auth.service";
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
  protected readonly faEye = faEye;

  signInForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  isGoogleSignInAvailable: boolean = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      email: [ '', [ Validators.required, Validators.email ] ],
      password: [ '', [ Validators.required, Validators.minLength(6) ] ]
    });

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      this.loading = true;
      window.history.replaceState({}, document.title, window.location.pathname);
      this.authService.restoreSessionFromToken(token).subscribe({
        next: user => {
          this.authService.navigateByRole(user.role);
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Login failed';
          this.loading = false;
        }
      });
      return;
    }

    // already logged in
    const existingUser = this.authService.getUser();
    if (existingUser) {
      const googleLink = params.get('googleLink');
      if (googleLink) {
        window.location.href = `${ this.authService.getAccountProfileUrlForRole(existingUser.role) }?googleLink=${ encodeURIComponent(googleLink) }`;
      } else {
        this.authService.navigateByRole(existingUser.role);
      }
    }
  }

  ngAfterViewInit(): void {
    const user = this.authService.getUser();
    if (user) this.authService.navigateByRole(user.role);
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
        this.authService.navigateByRole(res.user.role);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }

  get email() {
    return this.signInForm.get('email')!;
  }

  get password() {
    return this.signInForm.get('password')!;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
