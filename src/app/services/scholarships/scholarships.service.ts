import { Injectable } from '@angular/core';
import { IScholarships } from './IScholarships';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScholarshipsService {
private apiUrl = 'assets/mock-data/scholarships.data.json';
private cachedScholarships: IScholarships[] = [];
  
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

    //update bookmark status
    updateBookmark(id: number, isBookmarked: boolean): Observable<IScholarships | undefined> {
    // Simulate updating local cached data
    const index = this.cachedScholarships.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.cachedScholarships[index].isBookmarked = isBookmarked;
      return of(this.cachedScholarships[index]);
    } else {
      // If not loaded yet, load first then update
      return this.getScholarships().pipe(
        map((data) => {
          const found = data.find((s) => s.id === id);
          if (found) found.isBookmarked = isBookmarked;
          return found;
        })
      );
    }
  }
}
