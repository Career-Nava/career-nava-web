import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { ApiResponse } from '../api-response';
import { ConfigurationService } from '../configuration.service';
import { LocalStorageCache } from '../local-storage-cache';
import { RestService } from '../rest.service';
import { UserService } from "../user/user.service";
import { AdminBlog, AdminBlogUpsert, Blog } from './blog.model';

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

  getBlogBySlug(slug: string): Observable<Blog> {
    const cached = this.cache.get();
    const found = cached?.find(b => b.slug === slug);
    if (found) return of(found);

    return this.http
      .get<ApiResponse<Blog>>(`${ this.baseUrl }/GetBlogBySlug/${ encodeURIComponent(slug) }`)
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

  getAdminBlogById(id: number): Observable<AdminBlog> {
    return this.http.get<ApiResponse<AdminBlog>>(`${ this.baseUrl }/Admin/GetBlogById/${ id }`).pipe(
      map(res => this.mapAdminBlog(res.data)),
      catchError(err => throwError(() => err))
    );
  }

  createAdminBlog(payload: AdminBlogUpsert): Observable<AdminBlog> {
    return this.http.post<ApiResponse<AdminBlog>>(`${ this.baseUrl }/Admin/CreateBlog`, payload).pipe(
      map(res => this.mapAdminBlog(res.data)),
      catchError(err => throwError(() => err))
    );
  }

  updateAdminBlog(id: number, payload: AdminBlogUpsert): Observable<AdminBlog> {
    return this.http.put<ApiResponse<AdminBlog>>(`${ this.baseUrl }/Admin/UpdateBlog/${ id }`, payload).pipe(
      map(res => this.mapAdminBlog(res.data)),
      catchError(err => throwError(() => err))
    );
  }

  publishAdminBlog(id: number): Observable<AdminBlog> {
    return this.patchAdminBlogStatus(id, 'Publish');
  }

  moveAdminBlogToDraft(id: number): Observable<AdminBlog> {
    return this.patchAdminBlogStatus(id, 'MoveToDraft');
  }

  archiveAdminBlog(id: number): Observable<AdminBlog> {
    return this.patchAdminBlogStatus(id, 'Archive');
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
      blockQuote: dto.blockQuote ?? dto.quote,
      readingTime: dto.readingTime,
      createdDate: dto.createdDate ?? dto.createdAt,
      createdAt: dto.createdAt ?? dto.createdDate,
      updatedAt: dto.updatedAt,
      publishedAt: dto.publishedAt,
      archivedAt: dto.archivedAt,
      contents: dto.contents?.sort((a, b) => a.contentOrder - b.contentOrder),
      contentBlockCount: typeof dto.contentBlockCount === 'number' ? dto.contentBlockCount : dto.contents?.length ?? 0,
      status: dto.status,
      isPublished: dto.isPublished
    };
  }

  private patchAdminBlogStatus(id: number, action: 'Publish' | 'MoveToDraft' | 'Archive'): Observable<AdminBlog> {
    return this.http.patch<ApiResponse<AdminBlog>>(`${ this.baseUrl }/Admin/${ action }/${ id }`, {}).pipe(
      map(res => this.mapAdminBlog(res.data)),
      catchError(err => throwError(() => err))
    );
  }
}
