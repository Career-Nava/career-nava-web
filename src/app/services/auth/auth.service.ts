import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { catchError, map, Observable, throwError } from "rxjs";
import { ConfigurationService } from "../configuration.service";
import { RestService } from "../rest.service";
import { UserModel } from "../user/user.model";
import { AuthResponse, GoogleAuthRequest, LoginRequest, RegisterRequest } from "./auth.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService extends RestService {

  constructor(http: HttpClient, config: ConfigurationService, private router: Router) {
    super(http, 'auth', config.get<any>('api').baseUrl);
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${ this.baseUrl }/register`, payload);
  }

  login(payload: LoginRequest): Observable<AuthResponse['data']> {
    return this.http.post<AuthResponse>(`${ this.baseUrl }/login`, payload).pipe(
      map((res) => {
        if (res?.data) return res.data;
        throw new Error('Invalid response from server');
      }),
      catchError((err) => {
        console.error('Login request failed:', err);
        return throwError(() => err);
      })
    );
  }

  // New Google Login
  googleLogin(payload: GoogleAuthRequest): Observable<AuthResponse['data']> {
    return this.http.post<AuthResponse>(`${ this.baseUrl }/google`, payload).pipe(
      map(res => {
        if (res?.data) return res.data;
        throw new Error('Invalid response from server');
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

    void this.router.navigate([ '/sign-in' ]);
  }

  saveSession(token: string, user: UserModel): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): any {
    const data = localStorage.getItem('user');
    const parsed = data ? JSON.parse(data) : null;
    console.log('%c[AuthService] getUser ->', 'color: violet', parsed);
    return parsed;
  }

  getToken(): string | null {
    const token = localStorage.getItem('auth_token');
    console.log('%c[AuthService] getToken ->', 'color: violet', token);
    return token;
  }

  isAuthenticated(): boolean {
    const result = !!this.getToken();
    console.log('%c[AuthService] isAuthenticated ->', 'color: violet', result);
    return result;
  }
}
