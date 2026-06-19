import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { ApiResponse } from "../api-response";
import { ConfigurationService } from "../configuration.service";
import { RestService } from "../rest.service";
import { AdminOverview } from "./admin.model";

@Injectable({ providedIn: 'root' })
export class AdminService extends RestService {
  constructor(http: HttpClient, config: ConfigurationService) {
    super(http, 'Admin', config.get<any>('api').baseUrl);
  }

  getOverview(): Observable<AdminOverview> {
    return this.http
      .get<ApiResponse<AdminOverview>>(`${ this.baseUrl }/GetOverview`)
      .pipe(
        map(res => this.mapOverview(res.data)),
        catchError(err => throwError(() => err))
      );
  }

  private mapOverview(dto: AdminOverview | null | undefined): AdminOverview {
    return {
      totalMentors: typeof dto?.totalMentors === 'number' ? dto.totalMentors : 0,
      activeMentors: typeof dto?.activeMentors === 'number' ? dto.activeMentors : 0,
      totalMentees: typeof dto?.totalMentees === 'number' ? dto.totalMentees : 0,
      totalSessions: typeof dto?.totalSessions === 'number' ? dto.totalSessions : 0,
      upcomingSessions: typeof dto?.upcomingSessions === 'number' ? dto.upcomingSessions : 0,
      completedSessions: typeof dto?.completedSessions === 'number' ? dto.completedSessions : 0,
      totalScholarships: typeof dto?.totalScholarships === 'number' ? dto.totalScholarships : 0,
      totalBlogs: typeof dto?.totalBlogs === 'number' ? dto.totalBlogs : 0,
      pendingSessions: typeof dto?.pendingSessions === 'number' ? dto.pendingSessions : 0,
      inactiveMentors: typeof dto?.inactiveMentors === 'number' ? dto.inactiveMentors : 0,
      totalUsers: typeof dto?.totalUsers === 'number' ? dto.totalUsers : 0
    };
  }
}
