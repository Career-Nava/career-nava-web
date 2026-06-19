import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { ApiResponse } from '../api-response';
import { ConfigurationService } from '../configuration.service';
import { LocalStorageCache } from '../local-storage-cache';
import { RestService } from '../rest.service';
import { UserService } from "../user/user.service";
import { AdminBlog, Blog } from './blog.model';

@Injectable({ providedIn: 'root' })
export class BlogService extends RestService {
  private readonly cache = new LocalStorageCache<Blog>(
    'blogs',
    15 * 60 * 1000 // 15 minutes
  );

  constructor(http: HttpClient, config: ConfigurationService, private userService: UserService) {
    super(http, 'Blog', config.get<any>('api').baseUrl);
  }

  getAllBlogs(): Observable<Blog[]> {
    const cached = this.cache.get();
    if (cached) return of(cached);

    return this.http.get<ApiResponse<Blog[]>>(`${ this.baseUrl }/GetAllBlogs`).pipe(
      map(res => {
        const mapped = res.data.map(this.mapBlog);
        this.cache.set(mapped);
        return mapped;
      }),
      catchError(err => throwError(() => err))
    );
  }

  getBlogById(blogId: number): Observable<Blog> {
    const cached = this.cache.get();
    const found = cached?.find(b => b.blogId === blogId);
    if (found) return of(found);

    return this.http
      .get<ApiResponse<Blog>>(`${ this.baseUrl }/GetBlogById/${ blogId }`)
      .pipe(
        map(res => this.mapBlog(res.data)),
        catchError(err => throwError(() => err))
      );
  }

  getAdminBlogs(): Observable<AdminBlog[]> {
    return this.http.get<ApiResponse<Array<Partial<AdminBlog> & Partial<Blog>>>>(`${ this.baseUrl }/GetAllBlogsForAdmin`).pipe(
      map(res => (res.data ?? []).map(dto => this.mapAdminBlog(dto))),
      catchError(err => throwError(() => err))
    );
  }

  clearCache(): void {
    this.cache.clear();
  }

  private mapBlog(dto: Blog): Blog {
    return {
      ...dto,
      coverImage: dto.coverImage || 'assets/images/sessions/empty.png',
      contents: dto.contents?.sort((a, b) => a.contentOrder - b.contentOrder)
    };
  }

  private mapAdminBlog(dto: Partial<AdminBlog> & Partial<Blog>): AdminBlog {
    return {
      blogId: dto.blogId,
      title: dto.title,
      slug: dto.slug,
      authorId: dto.authorId ?? dto.author?.userId ?? undefined,
      authorName: dto.authorName ?? dto.author?.fullName ?? undefined,
      category: dto.category,
      coverImage: dto.coverImage || 'assets/images/sessions/empty.png',
      quote: dto.quote ?? dto.blockQuote,
      readingTime: dto.readingTime,
      createdDate: dto.createdDate ?? dto.createdAt,
      updatedAt: dto.updatedAt,
      contentBlockCount: typeof dto.contentBlockCount === 'number' ? dto.contentBlockCount : dto.contents?.length ?? 0,
      status: dto.status,
      isPublished: dto.isPublished
    };
  }
}
