import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, of, throwError } from "rxjs";
import { ApiResponse } from "../api-response";
import { ConfigurationService } from "../configuration.service";
import { LocalStorageCache } from "../local-storage-cache";
import { RestService } from "../rest.service";
import { ScholarshipDto } from "./shcolarship.model";

@Injectable({ providedIn: 'root' })
export class ScholarshipService extends RestService {

  private readonly cache = new LocalStorageCache<ScholarshipDto>(
    'scholarships',
    15 * 60 * 1000 // 15 minutes
  );

  constructor(http: HttpClient, config: ConfigurationService) {
    super(http, 'Scholarship', config.get<any>('api').baseUrl);
  }

  getAllScholarships(): Observable<ScholarshipDto[]> {
    const cached = this.cache.get();
    if (cached) return of(cached);

    return this.http.get<ApiResponse<ScholarshipDto[]>>(`${ this.baseUrl }/GetAllScholarships`).pipe(
      map(res => {
        const mapped = (res.data ?? []).map(dto => this.mapScholarship(dto));
        this.cache.set(mapped);
        return mapped;
      }),
      catchError(() => of([])) // fallback to empty array
    );
  }

  getScholarshipById(id: number): Observable<ScholarshipDto> {
    const cached = this.cache.get()?.find(s => s.scholarshipId === id);
    if (cached) return of(cached);

    return this.http.get<ApiResponse<ScholarshipDto>>(`${ this.baseUrl }/GetScholarshipById/${ id }`).pipe(
      map(res => {
        const mapped = this.mapScholarship(res.data);
        const all = this.cache.get() ?? [];
        all.push(mapped);
        this.cache.set(all);
        return mapped;
      }),
      catchError(err => throwError(() => err))
    );
  }

  updateBookmark(id: number, isBookmarked: boolean): Observable<ScholarshipDto | undefined> {
    const all = this.cache.get() ?? [];
    const index = all.findIndex(s => s.scholarshipId === id);
    if (index !== -1) {
      all[index].isBookmarked = isBookmarked;
      this.cache.set(all);
      return of(all[index]);
    }
    return of(undefined);
  }

  clearCache(): void {
    this.cache.clear();
  }

  private mapScholarship(dto: ScholarshipDto): ScholarshipDto {
    return {
      ...dto
    };
  }
}
