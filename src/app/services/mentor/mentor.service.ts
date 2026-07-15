import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, of, throwError } from "rxjs";
import { ApiResponse } from "../api-response";
import { ConfigurationService } from "../configuration.service";
import { LocalStorageCache } from "../local-storage-cache";
import { RestService } from "../rest.service";
import { AdminMentor, AdminMentorUpdate, EligibleMentorUser, Mentor, MentorOnboardingRequest, MentorSelfProfile, UpdateMentorSelfProfileRequest } from "./mentor.model";

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

  getAdminMentors(): Observable<AdminMentor[]> {
    return this.http
      .get<ApiResponse<Array<Partial<AdminMentor> & Partial<Mentor>>>>(`${ this.baseUrl }/GetAllMentorsForAdmin`)
      .pipe(
        map(res => (Array.isArray(res.data) ? res.data : []).map(dto => this.mapAdminMentor(dto))),
        catchError(err => throwError(() => err))
      );
  }

  getEligibleMentorUsers(): Observable<EligibleMentorUser[]> {
    return this.http
      .get<ApiResponse<EligibleMentorUser[]>>(`${ this.baseUrl }/Admin/EligibleUsers`)
      .pipe(
        map(res => res.data ?? []),
        catchError(err => throwError(() => err))
      );
  }

  onboardExistingUser(payload: MentorOnboardingRequest): Observable<AdminMentor> {
    return this.http
      .post<ApiResponse<AdminMentor>>(`${ this.baseUrl }/Admin/OnboardExistingUser`, payload)
      .pipe(
        map(res => this.mapAdminMentor(res.data)),
        catchError(err => throwError(() => err))
      );
  }

  getAdminMentorById(id: number): Observable<AdminMentor> {
    return this.http
      .get<ApiResponse<AdminMentor>>(`${ this.baseUrl }/Admin/GetMentorById/${ id }`)
      .pipe(
        map(res => this.mapAdminMentor(res.data)),
        catchError(err => throwError(() => err))
      );
  }

  getSelfProfile(): Observable<MentorSelfProfile> {
    return this.http
      .get<ApiResponse<MentorSelfProfile>>(`${ this.baseUrl }/Self/Profile`)
      .pipe(
        map(res => this.mapSelfProfile(res.data)),
        catchError(err => throwError(() => err))
      );
  }

  updateSelfProfile(payload: UpdateMentorSelfProfileRequest): Observable<MentorSelfProfile> {
    return this.http
      .put<ApiResponse<MentorSelfProfile>>(`${ this.baseUrl }/Self/Profile`, payload)
      .pipe(
        map(res => this.mapSelfProfile(res.data)),
        catchError(err => throwError(() => err))
      );
  }

  updateAdminMentor(id: number, payload: AdminMentorUpdate): Observable<AdminMentor> {
    return this.http
      .put<ApiResponse<AdminMentor>>(`${ this.baseUrl }/Admin/UpdateMentor/${ id }`, payload)
      .pipe(
        map(res => this.mapAdminMentor(res.data)),
        catchError(err => throwError(() => err))
      );
  }

  updateAdminMentorStatus(id: number, status: string): Observable<AdminMentor> {
    return this.http
      .patch<ApiResponse<AdminMentor>>(`${ this.baseUrl }/Admin/UpdateStatus/${ id }`, { status })
      .pipe(
        map(res => this.mapAdminMentor(res.data)),
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
      avgRating: typeof dto.avgRating === 'number' ? dto.avgRating : 0,
      schedulingAssigned: dto.schedulingAssigned === true
    };
  }

  private mapSelfProfile(dto: MentorSelfProfile): MentorSelfProfile {
    const mappedMentor = this.mapMentor(dto);
    return {
      ...mappedMentor,
      mentorProfileId: dto.mentorProfileId,
      mentorProfileStatus: dto.mentorProfileStatus,
      verified: dto.verified,
      location: dto.location ?? null,
      yearsExperience: typeof dto.yearsExperience === 'number' ? dto.yearsExperience : null,
      availableExpertises: dto.availableExpertises ?? [],
      availableDisciplines: dto.availableDisciplines ?? [],
      availableFluencies: dto.availableFluencies ?? [],
      scheduling: dto.scheduling ?? null
    };
  }

  private mapAdminMentor(dto: Partial<AdminMentor> & Partial<Mentor>): AdminMentor {
    return {
      mentorId: dto.mentorId,
      mentorProfileId: dto.mentorProfileId ?? dto.mentorId,
      userId: dto.userId,
      fullName: dto.fullName,
      email: dto.email,
      role: dto.role,
      isActive: dto.isActive,
      schedulingAssigned: dto.schedulingAssigned === true,
      mentorProfileStatus: dto.mentorProfileStatus,
      verified: dto.verified,
      profilePicture: dto.profilePicture,
      location: dto.location,
      company: dto.company,
      title: dto.title ?? dto.positionTitle,
      positionTitle: dto.positionTitle ?? dto.title,
      linkedIn: dto.linkedIn ?? dto.linkedInUrl,
      linkedInUrl: dto.linkedInUrl ?? dto.linkedIn,
      bio: dto.bio,
      yearsExperience: dto.yearsExperience,
      avgRating: typeof dto.avgRating === 'number' ? dto.avgRating : typeof dto.rating === 'number' ? dto.rating : 0,
      rating: typeof dto.rating === 'number' ? dto.rating : typeof dto.avgRating === 'number' ? dto.avgRating : 0,
      avgAttendance: dto.avgAttendance,
      totalReviews: typeof dto.totalReviews === 'number' ? dto.totalReviews : 0,
      totalSessions: typeof dto.totalSessions === 'number' ? dto.totalSessions : 0,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      expertise: dto.expertise ?? [],
      disciplines: dto.disciplines ?? [],
      fluency: dto.fluency ?? [],
      experiences: (dto.experiences ?? []).map(e => ({
        ...e,
        year: e.year || (e.startDate ? `${ new Date(e.startDate).getFullYear() } - ${ e.endDate ? new Date(e.endDate).getFullYear() : 'Present' }` : 'N/A')
      }))
    };
  }
}
