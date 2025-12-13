import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private blogData = 'assets/mock-data/blogs/data.json';

  constructor(private http: HttpClient) {}

  getBlogs(): Observable<any> {
    return this.http.get<any>(this.blogData);
  }

  getBlogById(id: number): Observable<any> {
    return this.http.get<any>(this.blogData);
  }
}
