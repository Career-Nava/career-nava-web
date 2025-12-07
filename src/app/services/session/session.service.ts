import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from "rxjs";
import { ConfigurationService } from "../configuration.service";
import { RestService } from "../rest.service";
import { ApiResponse, Session } from "./session.model";

@Injectable({
  providedIn: 'root'
})
export class SessionService extends RestService {
  private readonly STORAGE_KEY = "sessions";
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  constructor(http: HttpClient, config: ConfigurationService) {
    super(http, 'Session', config.get<any>('api').baseUrl);
  }

  // Read cached sessions list (if valid)
  private getCachedSessions(): Session[] | null {
    const cached = localStorage.getItem(this.STORAGE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const isStale = Date.now() - parsed.timestamp > this.CACHE_TTL;

    if (isStale || !parsed.data) {
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }

    return parsed.data as Session[];
  }

  // Save sessions list to cache
  private setCachedSessions(data: Session[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  }

  // Get all sessions  (THE ONLY cached endpoint)
  getAllSessions(): Observable<Session[]> {
    const cached = this.getCachedSessions();
    if (cached) {
      console.log("✅ Loaded sessions from cache");
      return of(cached);
    }

    console.log("🌐 Fetching sessions from API…");

    return this.http.get<ApiResponse<Session[]>>(`${ this.baseUrl }`).pipe(
      map(res => {
        const mapped = res.data.map(this.mapSession);
        this.setCachedSessions(mapped);
        return mapped;
      }),
      catchError(err => {
        console.error("Failed to fetch sessions:", err);
        return throwError(() => err);
      })
    );
  }

  // Get session by ID (reads from all-sessions cache first)
  getSessionById(sessionId: number): Observable<Session> {
    const cached = this.getCachedSessions();
    if (cached) {
      const found = cached.find(s => s.sessionId === sessionId);
      if (found) {
        console.log(`✅ Loaded session #${ sessionId } from cache`);
        return of(found);
      }
    }

    console.log(`🌐 Fetching session #${ sessionId } from API…`);

    return this.http.get<ApiResponse<Session>>(`${ this.baseUrl }/${ sessionId }`).pipe(
      map(res => this.mapSession(res.data)),
      catchError(err => throwError(() => err))
    );
  }

  // Get by mentor (filters cached list first)
  getSessionsByMentor(mentorId: number): Observable<Session[]> {
    const cached = this.getCachedSessions();
    if (cached) {
      const list = cached.filter(s => s.mentorId === mentorId);
      if (list.length > 0) {
        console.log(`✅ Loaded mentor #${ mentorId } sessions from cache`);
        return of(list);
      }
    }

    console.log(`🌐 Fetching mentor #${ mentorId } sessions from API…`);

    return this.http.get<ApiResponse<Session[]>>(`${ this.baseUrl }/mentor/${ mentorId }`).pipe(
      map(res => res.data.map(this.mapSession)),
      catchError(err => throwError(() => err))
    );
  }

  // Get by mentee (filters cached list first)
  getSessionsByMentee(menteeId: number): Observable<Session[]> {
    const cached = this.getCachedSessions();
    if (cached) {
      const list = cached.filter(s => s.menteeId === menteeId);
      if (list.length > 0) {
        console.log(`✅ Loaded mentee #${ menteeId } sessions from cache`);
        return of(list);
      }
    }

    console.log(`🌐 Fetching mentee #${ menteeId } sessions from API…`);

    return this.http.get<ApiResponse<Session[]>>(`${ this.baseUrl }/mentee/${ menteeId }`).pipe(
      map(res => res.data.map(this.mapSession)),
      catchError(err => throwError(() => err))
    );
  }

  // Clear entire sessions cache
  clearCache(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private mapSession(dto: Session): Session {
    return {
      ...dto,
      calendlyStartAt: dto.calendlyStartAt ?? null,
      calendlyEndAt: dto.calendlyEndAt ?? null,
      thumbnailUrl: dto.thumbnailUrl || "assets/images/sessions/empty.png",
      category: dto.category || "coaching",
      title: dto.title || "Untitled Session"
    };
  }
}
