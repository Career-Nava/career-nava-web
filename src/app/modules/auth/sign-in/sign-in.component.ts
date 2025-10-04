import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared/shared.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {Router} from "@angular/router";
import { AuthService, IUser } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {

  signInForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  constructor(private router: Router, private authService: AuthService) { }

  onSubmit() {
    if (this.signInForm.valid) {
      const email = this.signInForm.value.email;
      const password = this.signInForm.value.password;
  
      // Since form is validated, these should be strings, but we add extra guards for safety
      if (typeof email === 'string' && typeof password === 'string') {
        this.authService.login(email, password).subscribe((user: IUser | null) => {
          if (user) {
            switch (user.role) {
              case 'student':
                this.router.navigate(['/mentee/mentors']);
                break;
              case 'teacher':
                this.router.navigate(['/teacher/overview']);
                break;
              case 'admin':
                this.router.navigate(['/admin/overview']);
                break;
              default:
                console.error('Invalid role');
                break;
            }
          } else {
            console.error('Invalid credentials');
          }
        });
      } else {
        console.error('Email or Password is not a string');
      }
    } else {
      console.error('Form is not valid');
    }
  }
  
  get email() {
    return this.signInForm.get('email') as FormControl<string>;
  }
  
  get password() {
    return this.signInForm.get('password') as FormControl<string>;
  }
}
