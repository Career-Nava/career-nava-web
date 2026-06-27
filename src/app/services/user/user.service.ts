import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from "rxjs";
import { ApiResponse } from "../api-response";
import { ConfigurationService } from "../configuration.service";
import { LocalStorageCache } from "../local-storage-cache";
import { RestService } from "../rest.service";
import { UserModel } from "./user.model";

@Injectable({ providedIn: 'root' })
export class UserService extends RestService {
  private readonly cache = new LocalStorageCache<UserModel>(
    'users',
    24 * 60 * 60 * 1000 // 24 hours
  );

  constructor(http: HttpClient, config: ConfigurationService) {
    super(http, 'User', config.get<any>('api').baseUrl);
  }

  getAllUsers(): Observable<UserModel[]> {
    const cached = this.cache.get();
    if (cached) return of(cached);

    return this.http
      .get<ApiResponse<UserModel[]>>(`${ this.baseUrl }/GetAllUsers`)
      .pipe(
        map(res => {
          const users = res.data ?? [];
          this.cache.set(users);
          return users;
        }),
        catchError(err => throwError(() => err))
      );
  }

  getUserById(userId: number): Observable<UserModel> {
    const cached = this.cache.get();
    const found = cached?.find(u => u.userId === userId);
    if (found) return of(found);

    return this.http
      .get<ApiResponse<UserModel>>(`${ this.baseUrl }/GetUserById/${ userId }`)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  getCurrentUser(): Observable<UserModel> {
    return this.http
      .get<ApiResponse<UserModel>>(`${ this.baseUrl }/me`)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  clearCache(): void {
    this.cache.clear();
  }
}
