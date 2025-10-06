import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { SharedModule } from '../../../../shared/shared/shared.module';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
signUpForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
    role: new FormControl('mentee', [Validators.required]) // default value
  });

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    if (this.signUpForm.valid) {
      const { firstName, lastName, email, password, confirmPassword, role } = this.signUpForm.value;

      if (password !== confirmPassword) {
        console.error('Passwords do not match');
        return;
      }

      if (typeof email === 'string' && typeof password === 'string' && typeof role === 'string') {
        this.authService.register({
          firstName: firstName ?? undefined,
          lastName: lastName ?? undefined,
          email,
          password,
          role
        }).subscribe({
          next: (res) => {
            console.log('Registration successful:', res);
            // Navigate to sign-in or mentee/mentor dashboard
            if (role === 'mentee') {
              this.router.navigate(['/mentee/mentors']);
            } else {
              this.router.navigate(['/mentor/overview']);
            }
          },
          error: (err) => {
            console.error('Registration failed:', err);
          }
        });
      } else {
        console.error('Invalid field types');
      }
    } else {
      console.error('Form is not valid');
    }
  }

  get firstName() {
    return this.signUpForm.get('firstName') as FormControl<string>;
  }

  get lastName() {
    return this.signUpForm.get('lastName') as FormControl<string>;
  }

  get email() {
    return this.signUpForm.get('email') as FormControl<string>;
  }

  get password() {
    return this.signUpForm.get('password') as FormControl<string>;
  }

  get confirmPassword() {
    return this.signUpForm.get('confirmPassword') as FormControl<string>;
  }

  get role() {
    return this.signUpForm.get('role') as FormControl<string>;
  }
}
