import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";
import { BehaviorSubject, catchError, map, Observable, of, shareReplay, throwError } from "rxjs";
import { ApiResponse } from "../api-response";
import { ConfigurationService } from "../configuration.service";
import { RestService } from "../rest.service";
import { UserModel } from "../user/user.model";
import { AuthPayload, JwtClaims, LoginRequest, RegisterRequest } from "./auth.model";

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

export interface AuthSessionState {
  status: AuthStatus;
  user: UserModel | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService extends RestService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user';
  private readonly apiBaseUrl: string;

  private initialization$?: Observable<AuthSessionState>;
  private readonly userSubject = new BehaviorSubject<UserModel | null>(null);
  private readonly authStateSubject = new BehaviorSubject<AuthSessionState>({ status: 'initializing', user: null });

  readonly user$ = this.userSubject.asObservable();
  readonly authState$ = this.authStateSubject.asObservable();

  constructor(http: HttpClient, config: ConfigurationService, private router: Router) {
    const apiBaseUrl = config.get<any>('api').baseUrl;
    super(http, 'auth', apiBaseUrl);
    this.apiBaseUrl = apiBaseUrl;
  }

  initializeAuth(): Observable<AuthSessionState> {
    const current = this.authStateSubject.value;
    if (current.status !== 'initializing') return of(current);
    if (this.initialization$) return this.initialization$;

    const token = this.readStoredToken();
    if (!token) {
      this.clearSession(false);
      return of(this.authStateSubject.value);
    }

    if (!this.isTokenValid(token)) {
      this.clearSession(false);
      return of(this.authStateSubject.value);
    }

    const claimsUser = this.createUserFromToken(token);
    if (!claimsUser) {
      this.clearSession(false);
      return of(this.authStateSubject.value);
    }

    this.userSubject.next(claimsUser);

    this.initialization$ = this.refreshCurrentUser().pipe(
      map(user => this.setAuthenticated(user)),
      catchError(() => {
        this.clearSession(false);
        return of(this.authStateSubject.value);
      }),
      shareReplay(1)
    );

    return this.initialization$;
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

  getGoogleLinkAuthorizationUrl(): Observable<string> {
    return this.http
      .get<ApiResponse<{ authorizationUrl: string }>>(`${ this.baseUrl }/google/link`)
      .pipe(
        map(res => {
          const authorizationUrl = res?.data?.authorizationUrl;
          if (!authorizationUrl) throw new Error('Invalid Google link response');
          return authorizationUrl;
        }),
        catchError(err => throwError(() => err))
      );
  }

  logout(): void {
    this.clearSession(true);
    void this.router.navigate([ '/sign-in' ]);
  }

  getUser(): UserModel | null {
    return this.userSubject.value;
  }

  getToken(): string | null {
    const token = this.readStoredToken();
    if (!token) return null;

    if (!this.isTokenValid(token)) {
      this.clearSession(false);
      return null;
    }

    return token;
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.status === 'authenticated' && !!this.getToken() && !!this.getUser();
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

  getAccountProfileUrlForRole(role: string | undefined): string {
    switch (role) {
      case 'mentor':
        return '/mentor/account';
      case 'admin':
        return '/admin/profile';
      case 'mentee':
      default:
        return '/mentee/profile';
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

  refreshCurrentUser(): Observable<UserModel> {
    return this.http.get<ApiResponse<UserModel>>(`${ this.apiBaseUrl }/User/me`).pipe(
      map(res => {
        if (!res?.data?.userId || !res.data.email || !res.data.role) {
          throw new Error('Invalid current user response');
        }

        const token = this.getToken();
        if (!token) {
          throw new Error('Missing authentication token');
        }

        this.saveSession({ token, user: res.data });
        return res.data;
      }),
      catchError(err => {
        this.clearSession(false);
        return throwError(() => err);
      })
    );
  }

  restoreSessionFromToken(token: string): Observable<UserModel> {
    try {
      if (!this.isTokenValid(token)) {
        this.clearSession(false);
        return throwError(() => new Error('Invalid authentication token'));
      }

      const claimsUser = this.createUserFromToken(token);
      if (!claimsUser) {
        this.clearSession(false);
        return throwError(() => new Error('Invalid authentication token'));
      }

      localStorage.setItem(this.TOKEN_KEY, token);
      this.userSubject.next(claimsUser);
      return this.refreshCurrentUser();
    } catch {
      this.clearSession(false);
      return throwError(() => new Error('Invalid authentication token'));
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
    this.setAuthenticated(user);
  }

  private clearSession(resetInitialization = true): void {
    this.clearStoredSession();
    this.userSubject.next(null);
    this.authStateSubject.next({ status: 'unauthenticated', user: null });
    if (resetInitialization) this.initialization$ = undefined;
  }

  private clearStoredSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private readStoredToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private createUserFromToken(token: string): UserModel | null {
    try {
      const jwtClaims = jwtDecode<JwtClaims>(token);
      const userId = +jwtClaims.nameid;

      if (!userId || !jwtClaims.email || !jwtClaims.role) return null;

      return {
        userId,
        email: jwtClaims.email,
        role: jwtClaims.role,
        fullName: jwtClaims.unique_name ?? '',
        isActive: true,
        calendlyConnected: false
      };
    } catch {
      return null;
    }
  }

  private setAuthenticated(user: UserModel): AuthSessionState {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
    const state: AuthSessionState = { status: 'authenticated', user };
    this.authStateSubject.next(state);
    return state;
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
