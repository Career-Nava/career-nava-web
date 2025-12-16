import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, of, throwError } from "rxjs";
import { ApiResponse } from "../api-response";
import { ConfigurationService } from "../configuration.service";
import { LocalStorageCache } from "../local-storage-cache";
import { RestService } from "../rest.service";
import { Session } from "./session.model";

@Injectable({ providedIn: 'root' })
export class SessionService extends RestService {
  private readonly cache = new LocalStorageCache<Session>(
    'sessions',
    15 * 60 * 1000 // 15 minutes
  );

  constructor(http: HttpClient, config: ConfigurationService) {
    super(http, 'Session', config.get<any>('api').baseUrl);
  }

  getAllSessions(): Observable<Session[]> {
    const cached = this.cache.get();
    if (cached) return of(cached);

    return this.http.get<ApiResponse<Session[]>>(this.baseUrl).pipe(
      map(res => {
        const mapped = res.data.map(this.mapSession);
        this.cache.set(mapped);
        return mapped;
      }),
      catchError(err => throwError(() => err))
    );
  }

  getSessionById(sessionId: number): Observable<Session> {
    const cached = this.cache.get();
    const found = cached?.find(s => s.sessionId === sessionId);
    if (found) return of(found);

    return this.http
      .get<ApiResponse<Session>>(`${ this.baseUrl }/${ sessionId }`)
      .pipe(
        map(res => this.mapSession(res.data)),
        catchError(err => throwError(() => err))
      );
  }

  getSessionsByMentor(mentorId: number): Observable<Session[]> {
    const cached = this.cache.get();
    if (cached) {
      return of(cached.filter(s => s.mentorId === mentorId));
    }

    return this.http
      .get<ApiResponse<Session[]>>(`${ this.baseUrl }/mentor/${ mentorId }`)
      .pipe(
        map(res => res.data.map(this.mapSession)),
        catchError(err => throwError(() => err))
      );
  }

  getSessionsByMentee(menteeId: number): Observable<Session[]> {
    const cached = this.cache.get();
    if (cached) {
      return of(cached.filter(s => s.menteeId === menteeId));
    }

    return this.http
      .get<ApiResponse<Session[]>>(`${ this.baseUrl }/mentee/${ menteeId }`)
      .pipe(
        map(res => res.data.map(this.mapSession)),
        catchError(err => throwError(() => err))
      );
  }

  clearCache(): void {
    this.cache.clear();
  }

  private mapSession(dto: Session): Session {
    return {
      ...dto,
      calendlyStartAt: dto.calendlyStartAt ?? null,
      calendlyEndAt: dto.calendlyEndAt ?? null,
      thumbnailUrl: dto.thumbnailUrl || 'assets/images/sessions/empty.png',
      category: dto.category || 'coaching',
      title: dto.title || 'Untitled Session'
    };
  }
}
