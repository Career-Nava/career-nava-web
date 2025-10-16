import { Injectable } from '@angular/core';
import { IScholarships } from './IScholarships';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScholarshipsService {
private apiUrl = 'assets/mock-data/scholarships.data.json';
  
    constructor(private http: HttpClient) {}
  
    // Get all mentors
    getScholarships(): Observable<IScholarships[]> {
      return this.http.get<IScholarships[]>(this.apiUrl);
    }
  
    // Get mentor by ID
    getScholarshipById(id: number): Observable<IScholarships | undefined> {
      return this.getScholarships().pipe(
        map((sessions: IScholarships[]) => sessions.find(m => m.id === id))
      );
    }
}
