import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthResponse } from "../../../../services/auth/auth.model";
import { AuthService } from "../../../../services/auth/auth.service";
import { SharedModule } from "../../../../shared/shared.module";

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
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
    console.log('%c[SignUpComponent] ngOnInit called', 'color: cyan');

    const user = this.authService.getUser();
    if (user) {
      console.log('%c[SignUpComponent] User already logged in, redirecting...', 'color: lime');
      this.navigateByRole(user.role);
    }

    this.signUpForm = this.fb.group(
      {
        fullName: [ '', Validators.required ],
        email: [ '', [ Validators.required, Validators.email ] ],
        password: [ '', [ Validators.required, Validators.minLength(6) ] ],
        confirmPassword: [ '', Validators.required ]
      },
      { validators: this.passwordMatchValidator }
    );

    this.signUpForm = this.fb.group(
      {
        fullName: [ '', [ Validators.required ] ],
        email: [ '', [ Validators.required, Validators.email ] ],
        password: [ '', [ Validators.required, Validators.minLength(6) ] ],
        confirmPassword: [ '', [ Validators.required ] ],
      },
      { validators: [ this.passwordMatchValidator ] }
    );
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  ngAfterViewInit(): void {
    const user = this.authService.getUser();
    if (user) {
      console.log('%c[SignUpComponent] Redirecting user by role (AfterViewInit)...', 'color: lime');
      this.navigateByRole(user.role);
    }
  }

  onSubmit() {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched(); // show all errors
      return;
    }

    this.loading = true;
    const { fullName, email, password } = this.signUpForm.value;
    const payload = { fullName, email, password };

    console.log('%c[SignUpComponent] Submitting registration payload:', 'color: cyan', payload);

    this.authService.register(payload).subscribe({
      next: (res: AuthResponse) => {
        console.log('%c[SignUpComponent] Registration successful', 'color: lime', res);

        if (res?.data?.token && res?.data?.user) {
          this.authService.saveSession(res.data.token, res.data.user);
          this.navigateByRole(res.data.user.role);
        } else {
          console.warn('[SignUpComponent] Missing token/user in response');
          void this.router.navigate([ '/sign-in' ]);
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('%c[SignUpComponent] Registration failed', 'color: red', err);
        this.errorMessage = err.error?.message || 'Registration failed';
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
