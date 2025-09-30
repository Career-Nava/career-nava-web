import { Injectable } from '@angular/core';
import { IMentee } from './IMentees';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenteesService {
  
  private apiUrl = 'assets/mock-data/mentee.data.json';

  constructor(private http: HttpClient) {}

  // Get all mentees
  getMentees(): Observable<IMentee[]> {
    return this.http.get<IMentee[]>(this.apiUrl); 
  }

  // Get mentee by ID
  getMenteeById(id: number): Observable<IMentee | undefined> {
    return this.getMentees().pipe(
      map((mentee: IMentee[]) => mentee.find(m => m.id === id))
    );
  }
}
