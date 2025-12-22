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
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  updateUser(patch: Partial<UserModel>): void {
    const current = this.userSubject.value;
    if (!current) return;

    const updated = { ...current, ...patch };
    localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
    this.userSubject.next(updated);
  }

  restoreSessionFromToken(token: string): UserModel {
    const jwtClaims = jwtDecode<JwtClaims>(token);

    const user: UserModel = {
      userId: +jwtClaims.nameid,
      fullName: jwtClaims.unique_name,
      email: jwtClaims.email,
      role: jwtClaims.role,
      isActive: true,
      calendlyConnected: false // TODO: fix hardcoded data
    };

    this.saveSession({ token, user });
    return user;
  }


  private authenticate<T>(endpoint: string, payload: T): Observable<AuthPayload> {
    return this.http.post<ApiResponse<AuthPayload>>(endpoint, payload).pipe(
      map(res => {
        if (!res?.data) throw new Error('Invalid authentication response');
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
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }

  private loadUserFromStorage(): UserModel | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
