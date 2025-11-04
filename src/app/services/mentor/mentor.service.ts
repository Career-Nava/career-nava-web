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
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds

  constructor(http: HttpClient, config: ConfigurationService) {
    super(http, 'Mentor', config.get<any>('api').baseUrl);
  }

  // 🧠 GET all mentors with cache (15-minute TTL)
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
          // store fresh data with timestamp
          const payload = { timestamp: Date.now(), data: res.data };
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
          return res.data;
        }
        throw new Error("Invalid response from server");
      }),
      catchError((err) => {
        console.error("Failed to fetch mentors:", err);
        return throwError(() => err);
      })
    );
  }

  // GET mentor by ID
  getMentorById(id: number): Observable<Mentor> {
    const params = this.buildParams({ id });
    return this.http.get<ApiResponse<Mentor>>(`${ this.baseUrl }/GetMentorById/${ id }`, { params }).pipe(
      map((res) => {
        if (res?.data) return res.data;
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
          return res.data;
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
          return res.data;
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
}
