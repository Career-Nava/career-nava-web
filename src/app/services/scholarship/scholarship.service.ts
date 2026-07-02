import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, of, throwError } from "rxjs";
import { ApiResponse } from "../api-response";
import { ConfigurationService } from "../configuration.service";
import { LocalStorageCache } from "../local-storage-cache";
import { RestService } from "../rest.service";
import { AdminScholarship, AdminScholarshipUpsert, ScholarshipBookmarkDto, ScholarshipDto } from "./shcolarship.model";

type AdminScholarshipResponse = Partial<AdminScholarship> & {
  image?: string;
  openingDate?: string;
  closingDate?: string;
  deadline?: string;
  description?: string;
  menteesInterested?: unknown[];
};

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

  getMenteeScholarships(): Observable<ScholarshipDto[]> {
    return this.http.get<ApiResponse<ScholarshipDto[]>>(`${ this.baseUrl }/me`).pipe(
      map(res => (res.data ?? []).map(dto => this.mapScholarship(dto))),
      catchError(err => throwError(() => err))
    );
  }

  getSavedScholarships(): Observable<ScholarshipDto[]> {
    return this.http.get<ApiResponse<ScholarshipDto[]>>(`${ this.baseUrl }/me/saved`).pipe(
      map(res => (res.data ?? []).map(dto => this.mapScholarship(dto))),
      catchError(err => throwError(() => err))
    );
  }

  getMenteeScholarshipById(id: number): Observable<ScholarshipDto> {
    return this.http.get<ApiResponse<ScholarshipDto>>(`${ this.baseUrl }/me/${ id }`).pipe(
      map(res => this.mapScholarship(res.data)),
      catchError(err => throwError(() => err))
    );
  }

  saveScholarship(scholarshipId: number): Observable<ScholarshipBookmarkDto> {
    return this.http.post<ApiResponse<ScholarshipBookmarkDto>>(`${ this.baseUrl }/${ scholarshipId }/save`, {}).pipe(
      map(res => res.data),
      catchError(err => throwError(() => err))
    );
  }

  deleteSavedScholarship(scholarshipId: number): Observable<ScholarshipBookmarkDto> {
    return this.http.delete<ApiResponse<ScholarshipBookmarkDto>>(`${ this.baseUrl }/${ scholarshipId }/save`).pipe(
      map(res => res.data),
      catchError(err => throwError(() => err))
    );
  }

  getAdminScholarships(): Observable<AdminScholarship[]> {
    return this.http
      .get<ApiResponse<AdminScholarshipResponse[]>>(`${ this.baseUrl }/GetAllScholarshipsForAdmin`)
      .pipe(
        map(res => (res.data ?? []).map(dto => this.mapAdminScholarship(dto))),
        catchError(err => throwError(() => err))
      );
  }

  getAdminScholarshipById(id: number): Observable<AdminScholarship> {
    return this.http
      .get<ApiResponse<AdminScholarship>>(`${ this.baseUrl }/Admin/GetScholarshipById/${ id }`)
      .pipe(
        map(res => this.mapAdminScholarship(res.data)),
        catchError(err => throwError(() => err))
      );
  }

  createAdminScholarship(payload: AdminScholarshipUpsert): Observable<AdminScholarship> {
    return this.http
      .post<ApiResponse<AdminScholarship>>(`${ this.baseUrl }/Admin/CreateScholarship`, payload)
      .pipe(
        map(res => this.mapAdminScholarship(res.data)),
        catchError(err => throwError(() => err))
      );
  }

  updateAdminScholarship(id: number, payload: AdminScholarshipUpsert): Observable<AdminScholarship> {
    return this.http
      .put<ApiResponse<AdminScholarship>>(`${ this.baseUrl }/Admin/UpdateScholarship/${ id }`, payload)
      .pipe(
        map(res => this.mapAdminScholarship(res.data)),
        catchError(err => throwError(() => err))
      );
  }

  publishAdminScholarship(id: number): Observable<AdminScholarship> {
    return this.patchAdminScholarshipStatus(id, 'Publish');
  }

  moveAdminScholarshipToDraft(id: number): Observable<AdminScholarship> {
    return this.patchAdminScholarshipStatus(id, 'MoveToDraft');
  }

  closeAdminScholarship(id: number): Observable<AdminScholarship> {
    return this.patchAdminScholarshipStatus(id, 'Close');
  }

  archiveAdminScholarship(id: number): Observable<AdminScholarship> {
    return this.patchAdminScholarshipStatus(id, 'Archive');
  }

  clearCache(): void {
    this.cache.clear();
  }

  private mapScholarship(dto: ScholarshipDto): ScholarshipDto {
    return {
      ...dto
    };
  }

  private mapAdminScholarship(dto: AdminScholarshipResponse): AdminScholarship {
    return {
      scholarshipId: dto.scholarshipId,
      mentorProfileId: dto.mentorProfileId,
      title: dto.title,
      link: dto.link,
      role: dto.role,
      image: dto.image ?? dto.imageThumbnail,
      imageThumbnail: dto.imageThumbnail ?? dto.image,
      category: dto.category,
      funding: dto.funding,
      status: dto.status,
      openingDate: dto.openingDate ?? dto.datePosted,
      datePosted: dto.datePosted ?? dto.openingDate,
      closingDate: dto.closingDate ?? dto.applicationDeadline,
      applicationDeadline: dto.applicationDeadline ?? dto.closingDate,
      deadline: dto.deadline ?? dto.closingDate ?? dto.applicationDeadline,
      description: dto.description ?? dto.contentDescription,
      contentDescription: dto.contentDescription ?? dto.description,
      shortDescription: dto.shortDescription,
      eligibilityCriteria: dto.eligibilityCriteria,
      publishedAt: dto.publishedAt,
      closedAt: dto.closedAt,
      archivedAt: dto.archivedAt,
      benefits: dto.benefits,
      benefitsCount: typeof dto.benefitsCount === 'number' ? dto.benefitsCount : dto.benefits?.length ?? 0,
      interestedCount: typeof dto.interestedCount === 'number' ? dto.interestedCount : dto.menteesInterested?.length ?? 0,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    };
  }

  private patchAdminScholarshipStatus(id: number, action: 'Publish' | 'MoveToDraft' | 'Close' | 'Archive'): Observable<AdminScholarship> {
    return this.http
      .patch<ApiResponse<AdminScholarship>>(`${ this.baseUrl }/Admin/${ action }/${ id }`, {})
      .pipe(
        map(res => this.mapAdminScholarship(res.data)),
        catchError(err => throwError(() => err))
      );
  }
}
