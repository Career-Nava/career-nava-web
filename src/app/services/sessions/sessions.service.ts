import { Injectable } from '@angular/core';
import { ISessions } from './ISessions';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Mentor } from '../mentors/IMentor';

@Injectable({
  providedIn: 'root'
})
export class SessionsService {

  private apiUrl = 'assets/mock-data/sessions.data.json';
  
    constructor(private http: HttpClient) {}
  
    // Get all mentors
    getSessions(): Observable<ISessions[]> {
      return this.http.get<ISessions[]>(this.apiUrl);
    }
  
    // Get mentor by ID
    getSessionById(id: number): Observable<ISessions | undefined> {
      return this.getSessions().pipe(
        map((sessions: ISessions[]) => sessions.find(m => m.id === id))
      );
    }
}
