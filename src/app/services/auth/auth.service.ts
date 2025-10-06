import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';

export interface IUser {
  name?: string;
  email: string;
  password: string;
  role: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userDataUrl = 'assets/mock-data/users/data.json';

  constructor(private http: HttpClient, private router: Router) { }

  // login(email: string, password: string): Observable<IUser | null> {
  //   return this.http.get<IUser[]>(this.userDataUrl).pipe(
  //     map(users => {
  //       const user = users.find(u => u.email === email && u.password === password);
  //       if (user) {
  //         localStorage.setItem('currentUser', JSON.stringify(user));
  //         return user;
  //       }
  //       return null;
  //     }),
  //     catchError(error => {
  //       console.error('login error:', error);
  //       return of(null);
  //     })
  //   );
  // }

  login(email: string, password: string): Observable<IUser | null> {
    return this.http.get<IUser[]>(this.userDataUrl).pipe(
      map(users => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          this.safeSetItem('currentUser', JSON.stringify(user));
          return user;
        }
        return null;
      }),
      catchError(error => {
        console.error('login error:', error);
        return of(null);
      })
    );
  }

  register(userData: {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    role: string;
  }): Observable<IUser> {
    const newUser: IUser = {
      ...userData,
      name: `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim(),
    };

    // Simulate a successful registration response
    console.log('Mock register user:', newUser);
    this.safeSetItem('currentUser', JSON.stringify(newUser));

    return of(newUser); // Returns observable for UI compatibility
  }

  getUser(): IUser | null {
    const user = this.safeGetItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    this.safeRemoveItem('currentUser');
    this.router.navigate(['/home']);
  }

  private safeGetItem(key: string): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }

  private safeSetItem(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  private safeRemoveItem(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
}
