import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from "rxjs";
import { ConfigurationService } from "../configuration.service";
import { RestService } from "../rest.service";
import { ApiResponse, Scholarship, ScholarshipDto } from "./shcolarship.model";

@Injectable({
  providedIn: 'root'
})
export class ScholarshipService extends RestService {

  private cachedScholarships: Scholarship[] = [];
  private readonly STORAGE_KEY = 'cachedScholarships';
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  constructor(http: HttpClient, config: ConfigurationService) {
    super(http, 'Scholarship', config.get<any>('api').baseUrl);
    this.loadCache();
  }

  // Load from localStorage if still fresh
  private loadCache(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const isStale = Date.now() - parsed.timestamp > this.CACHE_TTL;
      if (!isStale && Array.isArray(parsed.data)) {
        this.cachedScholarships = parsed.data;
        console.log('✅ Scholarships loaded from cache');
      } else {
        console.log('⚠️ Scholarship cache expired — clearing');
        this.clearCache();
      }
    }
  }

  // Get all scholarships — uses TTL cache
  getAllScholarships(): Observable<Scholarship[]> {
    if (this.cachedScholarships.length > 0) {
      return of(this.cachedScholarships);
    }

    console.log('🌐 Fetching scholarships from API...');
    return this.http.get<ApiResponse<ScholarshipDto[]>>(`${ this.baseUrl }/GetAllScholarships`).pipe(
      map((res) => {
        if (res?.data?.length) {
          const scholarships = res.data.map(dto => this.mapToUIModel(dto));
          this.cachedScholarships = scholarships;
          this.saveCache(scholarships);
          return scholarships;
        }
        return [];
      }),
      catchError((err) => {
        console.error("❌ Failed to fetch scholarships:", err);
        return of([]); // prevent UI breakage
      })
    );
  }

  // Get scholarship by ID — uses cached data when possible
  getScholarshipById(id: number): Observable<Scholarship> {
    const cached = this.cachedScholarships.find(s => s.id === id);
    if (cached) {
      return of(cached);
    }

    return this.http.get<ApiResponse<ScholarshipDto>>(`${ this.baseUrl }/GetScholarshipById/${ id }`).pipe(
      map((res) => {
        if (res?.data) {
          const scholarship = this.mapToUIModel(res.data);
          this.cachedScholarships.push(scholarship);
          this.saveCache(this.cachedScholarships);
          return scholarship;
        }
        throw new Error("Invalid response from server");
      }),
      catchError((err) => {
        console.error(`❌ Failed to fetch scholarship #${ id }:`, err);
        return throwError(() => err);
      })
    );
  }

  // Update bookmark (syncs localStorage too)
  updateBookmark(id: number, isBookmarked: boolean): Observable<Scholarship | undefined> {
    const index = this.cachedScholarships.findIndex(s => s.id === id);
    if (index !== -1) {
      this.cachedScholarships[index].isBookmarked = isBookmarked;
      this.saveCache(this.cachedScholarships);
      return of(this.cachedScholarships[index]);
    }
    return of(undefined);
  }

  // Save cache with timestamp
  private saveCache(data: Scholarship[]): void {
    const payload = { timestamp: Date.now(), data };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
  }

  // Clear cached data
  clearCache(): void {
    this.cachedScholarships = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Map backend DTO → UI model
  private mapToUIModel(dto: ScholarshipDto): Scholarship {
    return {
      id: dto.scholarshipId,
      title: dto.title,
      link: '#', // TODO: replace placeholder
      role: 'Program Sponsor', // TODO: replace placeholder
      imageThumbnail: dto.imageThumbnail,
      date: new Date(), // TODO: replace placeholder
      applicationDeadline: new Date(), // TODO: replace placeholder
      reviews: 0, // TODO: replace placeholder
      rating: 0, // TODO: replace placeholder
      category: 'General', // TODO: replace placeholder
      shortDescription: dto.summary ?? '',
      funding: (dto.funding as any) ?? 'No Funding', // TODO: replace placeholder
      contentDescription: dto.description ?? '',
      eligibilityCriteria: 'Eligibility details coming soon.', // TODO: replace placeholder
      benefits: [], // TODO: replace placeholder
      status: (dto.status as 'active' | 'inactive') ?? 'inactive',
      isBookmarked: false,
      mentor: dto.mentor,
      menteesInterested: []
    };
  }
}
