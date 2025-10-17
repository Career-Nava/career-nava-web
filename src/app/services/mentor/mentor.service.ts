import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from "rxjs";
import { ConfigurationService } from "../configuration.service";
import { RestService } from "../rest.service";
import { ApiResponse, CreateMentorRequest, Mentor, UpdateMentorRequest } from "./mentor.model";

@Injectable({
  providedIn: 'root'
})
export class MentorService extends RestService {

  constructor(http: HttpClient, config: ConfigurationService) {
    super(http, 'Mentor', config.get<any>('api').baseUrl);
  }

  // GET all mentors
  getAllMentors(): Observable<Mentor[]> {
    return this.http.get<ApiResponse<Mentor[]>>(`${this.baseUrl}/GetAllMentors`).pipe(
      map((res) => {
        if (res?.data) return res.data;
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
    return this.http.get<ApiResponse<Mentor>>(`${this.baseUrl}/GetMentorById/${id}`, { params }).pipe(
      map((res) => {
        if (res?.data) return res.data;
        throw new Error("Invalid response from server");
      }),
      catchError((err) => {
        console.error(`Failed to fetch mentor #${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  // POST create mentor
  createMentor(payload: CreateMentorRequest): Observable<Mentor> {
    return this.http.post<ApiResponse<Mentor>>(`${this.baseUrl}/CreateMentor`, payload).pipe(
      map((res) => {
        if (res?.data) return res.data;
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
    return this.http.put<ApiResponse<Mentor>>(`${this.baseUrl}/UpdateMentor/${id}`, payload).pipe(
      map((res) => {
        if (res?.data) return res.data;
        throw new Error("Failed to update mentor");
      }),
      catchError((err) => {
        console.error(`Update mentor #${id} request failed:`, err);
        return throwError(() => err);
      })
    );
  }

  // DELETE deactivate mentor
  deleteMentor(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/DeleteMentor/${id}`).pipe(
      map((res) => res?.success === true),
      catchError((err) => {
        console.error(`Delete mentor #${id} request failed:`, err);
        return throwError(() => err);
      })
    );
  }
}
