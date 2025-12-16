import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, of, throwError } from "rxjs";
import { ApiResponse } from "../api-response";
import { ConfigurationService } from "../configuration.service";
import { LocalStorageCache } from "../local-storage-cache";
import { RestService } from "../rest.service";
import { Mentor } from "./mentor.model";

@Injectable({ providedIn: 'root' })
export class MentorService extends RestService {
  private readonly cache = new LocalStorageCache<Mentor>(
    'mentors',
    24 * 60 * 60 * 1000 // 24 hours
  );

  constructor(http: HttpClient, config: ConfigurationService) {
    super(http, 'Mentor', config.get<any>('api').baseUrl);
  }

  getAllMentors(): Observable<Mentor[]> {
    const cached = this.cache.get();
    if (cached) return of(cached);

    return this.http
      .get<ApiResponse<Mentor[]>>(`${ this.baseUrl }/GetAllMentors`)
      .pipe(
        map(res => {
          const mapped = res.data.map(this.mapMentor);
          this.cache.set(mapped);
          return mapped;
        }),
        catchError(err => throwError(() => err))
      );
  }

  getMentorById(id: number): Observable<Mentor> {
    const cached = this.cache.get();
    const found = cached?.find(m => m.userId === id);
    if (found) return of(found);

    return this.http
      .get<ApiResponse<Mentor>>(`${ this.baseUrl }/GetMentorById/${ id }`)
      .pipe(
        map(res => this.mapMentor(res.data)),
        catchError(err => throwError(() => err))
      );
  }

  clearCache(): void {
    this.cache.clear();
  }

  private mapMentor(dto: Mentor): Mentor {
    return {
      ...dto,
      experiences: dto.experiences?.map(e => ({
        ...e,
        year: e.startDate ? `${ new Date(e.startDate).getFullYear() } - ${ e.endDate ? new Date(e.endDate).getFullYear() : 'Present' }` : 'N/A'
      })),
      totalSessions: typeof dto.totalSessions === 'number' ? dto.totalSessions : 0,
      totalReviews: typeof dto.totalReviews === 'number' ? dto.totalReviews : 0,
      avgRating: typeof dto.avgRating === 'number' ? dto.avgRating : 0
    };
  }
}
