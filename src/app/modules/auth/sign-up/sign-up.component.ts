import { AfterViewInit, Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { AuthService } from "../../../services/auth/auth.service";
import { getUserErrorMessage } from "../../../services/user-error-message";
import { SharedModule } from "../../../shared/shared.module";

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './sign-up.component.html',
  styleUrls: [ './sign-up.component.scss' ] // fixed typo
})
export class SignUpComponent implements OnInit, AfterViewInit {
  protected readonly faEye = faEye;

  signUpForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPasswords = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    // Redirect if already logged in
    const user = this.authService.getUser();
    if (user) {
      this.authService.navigateByRole(user.role);
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
    if (user) this.authService.navigateByRole(user.role);
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
            this.authService.navigateByRole(user.role);
            this.loading = false;
          },
          error: err => {
            this.errorMessage = getUserErrorMessage(err, 'Registration succeeded but login failed.');
            this.loading = false;
          }
        });
      },
      error: err => {
        const fallback = err?.status === 409
          ? 'An account with this email already exists.'
          : 'Unable to create your account right now. Please try again later.';
        this.errorMessage = getUserErrorMessage(err, fallback);
        this.loading = false;
      }
    });
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

  togglePasswords(): void {
    this.showPasswords = !this.showPasswords;
  }
}
