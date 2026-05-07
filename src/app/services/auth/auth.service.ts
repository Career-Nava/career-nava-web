import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";
import { BehaviorSubject, catchError, map, Observable, throwError } from "rxjs";
import { ApiResponse } from "../api-response";
import { ConfigurationService } from "../configuration.service";
import { RestService } from "../rest.service";
import { UserModel } from "../user/user.model";
import { AuthPayload, JwtClaims, LoginRequest, RegisterRequest } from "./auth.model";

@Injectable({ providedIn: 'root' })
export class AuthService extends RestService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user';

  private readonly userSubject = new BehaviorSubject<UserModel | null>(this.loadUserFromStorage());
  readonly user$ = this.userSubject.asObservable();

  constructor(http: HttpClient, config: ConfigurationService, private router: Router) {
    super(http, 'auth', config.get<any>('api').baseUrl);
  }

  register(payload: RegisterRequest): Observable<void> {
    return this.http
      .post<ApiResponse<null>>(`${ this.baseUrl }/register`, payload)
      .pipe(
        map(() => void 0),
        catchError(err => throwError(() => err))
      );
  }

  login(payload: LoginRequest): Observable<AuthPayload> {
    return this.authenticate(`${ this.baseUrl }/login`, payload);
  }

  getGoogleConnectUrl(userId: number = 0): string {
    return `${ this.baseUrl }/google/connect?userId=${ userId }`;
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate([ '/sign-in' ]);
  }

  getUser(): UserModel | null {
    return this.userSubject.value;
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    if (!this.isTokenValid(token)) {
      this.clearSession();
      return null;
    }

    return token;
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  getRedirectUrlForRole(role: string | undefined): string {
    switch (role) {
      case 'mentor':
        return '/mentor/overview';
      case 'admin':
        return '/admin/overview';
      case 'mentee':
      default:
        return '/mentee/mentors';
    }
  }

  navigateByRole(role: string | undefined): void {
    void this.router.navigate([ this.getRedirectUrlForRole(role) ]);
  }

  updateUser(patch: Partial<UserModel>): void {
    const current = this.userSubject.value;
    if (!current) return;

    const updated = { ...current, ...patch };
    localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
    this.userSubject.next(updated);
  }

  restoreSessionFromToken(token: string): UserModel | null {
    try {
      if (!this.isTokenValid(token)) {
        this.clearSession();
        return null;
      }

      const jwtClaims = jwtDecode<JwtClaims>(token);
      const userId = +jwtClaims.nameid;

      if (!userId || !jwtClaims.email || !jwtClaims.role) {
        this.clearSession();
        return null;
      }

      const user: UserModel = {
        userId,
        fullName: jwtClaims.unique_name,
        email: jwtClaims.email,
        role: jwtClaims.role,
        isActive: true,
        calendlyConnected: false // TODO: fix hardcoded data
      };

      this.saveSession({ token, user });
      return user;
    } catch {
      this.clearSession();
      return null;
    }
  }


  private authenticate<T>(endpoint: string, payload: T): Observable<AuthPayload> {
    return this.http.post<ApiResponse<AuthPayload>>(endpoint, payload).pipe(
      map(res => {
        if (!res?.data) throw new Error('Invalid authentication response');
        if (!this.isTokenValid(res.data.token)) throw new Error('Invalid authentication token');
        this.saveSession(res.data);
        return res.data;
      })
    );
  }

  private saveSession({ token, user }: AuthPayload): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  private clearSession(): void {
    this.clearStoredSession();
    this.userSubject.next(null);
  }

  private clearStoredSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private loadUserFromStorage(): UserModel | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token || !this.isTokenValid(token)) {
      this.clearStoredSession();
      return null;
    }

    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) {
      this.clearStoredSession();
      return null;
    }

    try {
      const user = JSON.parse(raw) as UserModel;
      if (!user?.userId || !user.email || !user.role) {
        this.clearStoredSession();
        return null;
      }

      return user;
    } catch {
      this.clearStoredSession();
      return null;
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const jwtClaims = jwtDecode<JwtClaims>(token);
      return typeof jwtClaims.exp === 'number' && jwtClaims.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
