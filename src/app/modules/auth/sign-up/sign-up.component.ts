import { AfterViewInit, Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../services/auth/auth.service";
import { SharedModule } from "../../../shared/shared.module";

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './sign-up.component.html',
  styleUrls: [ './sign-up.component.scss' ] // fixed typo
})
export class SignUpComponent implements OnInit, AfterViewInit {
  signUpForm!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    // Redirect if already logged in
    const user = this.authService.getUser();
    if (user) {
      this.navigateByRole(user.role);
    }

    // Initialize form
    this.signUpForm = this.fb.group({
      fullName: [ '', Validators.required ],
      email: [ '', [ Validators.required, Validators.email ] ],
      password: [ '', [ Validators.required, Validators.minLength(6) ] ],
      confirmPassword: [ '', Validators.required ]
    }, { validators: [ this.passwordMatchValidator ] });
  }

  ngAfterViewInit(): void {
    const user = this.authService.getUser();
    if (user) this.navigateByRole(user.role);
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  }

  onSubmit(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { fullName, email, password } = this.signUpForm.value;

    this.authService.register({ fullName, email, password }).subscribe({
      next: () => {
        // After successful registration, auto-login
        this.authService.login({ email, password }).subscribe({
          next: ({ token, user }) => {
            // Session is automatically saved by authService
            this.navigateByRole(user.role);
            this.loading = false;
          },
          error: err => {
            console.error('Login after registration failed', err);
            this.errorMessage = 'Registration succeeded but login failed.';
            this.loading = false;
          }
        });
      },
      error: err => {
        console.error('Registration failed', err);
        this.errorMessage = err.error?.message || 'Registration failed';
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

  // convenience getters for template
  get fullName() {
    return this.signUpForm.get('fullName')!;
  }

  get email() {
    return this.signUpForm.get('email')!;
  }

  get password() {
    return this.signUpForm.get('password')!;
  }

  get confirmPassword() {
    return this.signUpForm.get('confirmPassword')!;
  }
}
