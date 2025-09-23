import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Mentor } from './IMentor';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MentorsService {

  private apiUrl = 'assets/mock-data/mentors.data.json';

  constructor(private http: HttpClient) {}

  // Get all mentors
  getMentors(): Observable<Mentor[]> {
    return this.http.get<Mentor[]>(this.apiUrl);
  }

  // Get mentor by ID
  getMentorById(id: number): Observable<Mentor | undefined> {
    return this.getMentors().pipe(
      map((mentors: Mentor[]) => mentors.find(m => m.id === id))
    );
  }
}
