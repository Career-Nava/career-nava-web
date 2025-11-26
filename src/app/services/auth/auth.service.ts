import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { BehaviorSubject, catchError, map, Observable, throwError } from "rxjs";
import { ConfigurationService } from "../configuration.service";
import { RestService } from "../rest.service";
import { UserModel } from "../user/user.model";
import { AuthResponse, GoogleAuthRequest, LoginRequest, RegisterRequest } from "./auth.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService extends RestService {

  // BehaviorSubject to hold current user state
  private userSubject = new BehaviorSubject<UserModel | null>(this.loadUserFromStorage());
  public userObservable = this.userSubject.asObservable();

  constructor(http: HttpClient, config: ConfigurationService, private router: Router) {
    super(http, 'auth', config.get<any>('api').baseUrl);
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${ this.baseUrl }/register`, payload);
  }

  login(payload: LoginRequest): Observable<AuthResponse['data']> {
    return this.http.post<AuthResponse>(`${ this.baseUrl }/login`, payload).pipe(
      map(res => {
        if (!res?.data) throw new Error('Invalid response from server');
        this.saveSession(res.data.token, res.data.user);
        return res.data;
      }),
      catchError(err => {
        console.error('Login request failed:', err);
        return throwError(() => err);
      })
    );
  }

  googleLogin(payload: GoogleAuthRequest): Observable<AuthResponse['data']> {
    return this.http.post<AuthResponse>(`${ this.baseUrl }/google`, payload).pipe(
      map(res => {
        if (!res?.data) throw new Error('Invalid response from server');
        this.saveSession(res.data.token, res.data.user);
        return res.data;
      }),
      catchError(err => {
        console.error('Google login failed:', err);
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.userSubject.next(null); // reset reactive user
    void this.router.navigate([ '/sign-in' ]);
  }

  saveSession(token: string, user: UserModel): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user); // update reactive user
  }

  getUser(): UserModel | null {
    return this.userSubject.value;
  }

  // Internal helper to load user from localStorage on service init
  private loadUserFromStorage(): UserModel | null {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Optional: helper to update just the user object without a full login
  updateUser(user: Partial<UserModel>): void {
    const current = this.userSubject.value;
    if (!current) return;
    const updated = { ...current, ...user };
    localStorage.setItem('user', JSON.stringify(updated));
    this.userSubject.next(updated);
  }
}
