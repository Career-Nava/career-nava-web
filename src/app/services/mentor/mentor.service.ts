import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, of, throwError } from "rxjs";
import { ConfigurationService } from "../configuration.service";
import { RestService } from "../rest.service";
import { ApiResponse, CreateMentorRequest, Mentor, UpdateMentorRequest } from "./mentor.model";

@Injectable({
  providedIn: 'root'
})
export class MentorService extends RestService {
  private readonly STORAGE_KEY = "mentors";
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  constructor(http: HttpClient, config: ConfigurationService) {
    super(http, 'Mentor', config.get<any>('api').baseUrl);
  }

  // GET all mentors with caching and mapping
  getAllMentors(): Observable<Mentor[]> {
    const cached = localStorage.getItem(this.STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const isStale = Date.now() - parsed.timestamp > this.CACHE_TTL;
      if (!isStale && parsed.data) {
        console.log("✅ Loaded mentors from cache");
        return of(parsed.data);
      }
    }

    console.log("🌐 Fetching mentors from API...");
    return this.http.get<ApiResponse<Mentor[]>>(`${ this.baseUrl }/GetAllMentors`).pipe(
      map((res) => {
        if (res?.data) {
          const mapped = res.data.map(this.mapMentor);
          // store fresh data with timestamp
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ timestamp: Date.now(), data: mapped }));
          return mapped;
        }
        throw new Error("Invalid response from server");
      }),
      catchError((err) => {
        console.error("Failed to fetch mentors:", err);
        return throwError(() => err);
      })
    );
  }

  // GET mentor by ID with caching + mapping
  getMentorById(id: number): Observable<Mentor> {
    const cached = localStorage.getItem(this.STORAGE_KEY);

    if (cached) {
      const parsed = JSON.parse(cached);
      const isStale = Date.now() - parsed.timestamp > this.CACHE_TTL;

      if (!isStale && Array.isArray(parsed.data)) {
        const found = parsed.data.find((m: Mentor) => m.userId === id);
        if (found) {
          console.log(`✅ Loaded mentor #${ id } from cache`);
          return of(found);
        }
      }
    }

    // Fallback: API call
    console.log(`🌐 Fetching mentor #${ id } from API...`);
    return this.http.get<ApiResponse<Mentor>>(`${ this.baseUrl }/GetMentorById/${ id }`).pipe(
      map((res) => {
        if (res?.data) return this.mapMentor(res.data);

        throw new Error("Invalid response from server");
      }),
      catchError((err) => {
        console.error(`Failed to fetch mentor #${ id }:`, err);
        return throwError(() => err);
      })
    );
  }

  // POST create mentor
  createMentor(payload: CreateMentorRequest): Observable<Mentor> {
    return this.http.post<ApiResponse<Mentor>>(`${ this.baseUrl }/CreateMentor`, payload).pipe(
      map((res) => {
        if (res?.data) {
          this.clearCache();
          return this.mapMentor(res.data);
        }
        throw new Error("Failed to create mentor");
      }),
      catchError((err) => {
        console.error("Create mentor request failed:", err);
        return throwError(() => err);
      })
    );
  }

  // PUT update mentor
  updateMentor(id: number, payload: UpdateMentorRequest): Observable<Mentor> {
    return this.http.put<ApiResponse<Mentor>>(`${ this.baseUrl }/UpdateMentor/${ id }`, payload).pipe(
      map((res) => {
        if (res?.data) {
          this.clearCache();
          return this.mapMentor(res.data);
        }
        throw new Error("Failed to update mentor");
      }),
      catchError((err) => {
        console.error(`Update mentor #${ id } request failed:`, err);
        return throwError(() => err);
      })
    );
  }

  // DELETE deactivate mentor
  deleteMentor(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<null>>(`${ this.baseUrl }/DeleteMentor/${ id }`).pipe(
      map((res) => {
        this.clearCache();
        return res?.success === true;
      }),
      catchError((err) => {
        console.error(`Delete mentor #${ id } request failed:`, err);
        return throwError(() => err);
      })
    );
  }

  // 🧹 Clear mentor cache
  clearCache(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Map backend Mentor DTO → frontend Mentor with defaults
  private mapMentor(dto: Mentor): Mentor {
    return {
      ...dto,
      profilePicture: dto.profilePicture,
      bio: dto.bio,
      expertise: dto.expertise,
      disciplines: dto.disciplines,
      fluency: dto.fluency,
      experiences: dto.experiences?.map(e => ({
        ...e,
        year: e.startDate ? `${ new Date(e.startDate).getFullYear() } - ${ e.endDate ? new Date(e.endDate).getFullYear() : 'Present' }` : 'N/A'
      })),
      totalSessions: typeof dto.totalSessions === 'number' ? dto.totalSessions : 0,
      totalReviews: typeof dto.totalReviews === 'number' ? dto.totalReviews : 0,
      avgRating: typeof dto.avgRating === 'number' ? dto.avgRating : 0,
      positionTitle: dto.positionTitle,
      company: dto.company
    };
  }
}
