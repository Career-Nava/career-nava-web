import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { faEye, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AdminBlog } from '../../../services/blog/blog.model';
import { BlogService } from '../../../services/blog/blog.service';
import { SharedModule } from '../../../shared/shared.module';

type BlogStatusFilter = 'all' | 'published' | 'draft' | 'unknown';

@Component({
  selector: 'app-admin-blogs',
  standalone: true,
  imports: [ DatePipe, NgClass, NgForOf, NgIf, SharedModule ],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss'
})
export class AdminBlogsComponent implements OnInit {
  protected readonly faPlus = faPlus;
  protected readonly faEye = faEye;
  protected readonly faPen = faPen;
  protected readonly faTrash = faTrash;

  blogs: AdminBlog[] = [];
  loading = true;
  error: string | null = null;

  searchQuery = '';
  statusFilter: BlogStatusFilter = 'all';

  constructor(private blogService: BlogService) {
  }

  ngOnInit(): void {
    this.blogService.getAdminBlogs().subscribe({
      next: blogs => {
        this.blogs = blogs;
        this.error = null;
        this.loading = false;
      },
      error: err => {
        this.blogs = [];
        this.error = this.getBlogLoadError(err);
        this.loading = false;
      }
    });
  }

  get filteredBlogs(): AdminBlog[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.blogs.filter(blog => {
      const normalizedStatus = this.getNormalizedStatus(blog);
      const matchesStatus = this.statusFilter === 'all' || normalizedStatus === this.statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        blog.title,
        blog.slug,
        blog.category,
        blog.authorName,
        blog.readingTime
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }

  get totalBlogs(): number {
    return this.blogs.length;
  }

  get publishedBlogs(): number {
    return this.blogs.filter(blog => this.getNormalizedStatus(blog) === 'published').length;
  }

  get draftBlogs(): number {
    return this.blogs.filter(blog => this.getNormalizedStatus(blog) === 'draft').length;
  }

  get filteredCount(): number {
    return this.filteredBlogs.length;
  }

  trackBlog(index: number, blog: AdminBlog): number | string {
    return blog.blogId ?? blog.slug ?? blog.title ?? index;
  }

  onSearch(value: string): void {
    this.searchQuery = value;
  }

  onStatusChange(value: string): void {
    this.statusFilter = value as BlogStatusFilter;
  }

  getStatusLabel(blog: AdminBlog): string {
    if (blog.status) {
      return blog.status;
    }

    if (blog.isPublished === true) {
      return 'Published';
    }

    if (blog.isPublished === false) {
      return 'Draft';
    }

    return 'Unknown';
  }

  getStatusBadgeClass(blog: AdminBlog): string {
    const status = blog.status?.toLowerCase();

    if (status === 'published' || status === 'active' || blog.isPublished === true) {
      return 'admin-badge--success';
    }

    if (status === 'draft' || status === 'inactive' || status === 'archived' || blog.isPublished === false) {
      return 'admin-badge--muted';
    }

    return 'admin-badge--warning';
  }

  getContentBlockCount(blog: AdminBlog): string {
    return typeof blog.contentBlockCount === 'number' ? `${ blog.contentBlockCount }` : '-';
  }

  getEmptyTitle(): string {
    return this.searchQuery || this.statusFilter !== 'all' ? 'No resources match the current filters' : 'No blogs or resources found';
  }

  getEmptyMessage(): string {
    if (this.searchQuery || this.statusFilter !== 'all') {
      return 'Try a broader search or switch back to all statuses to review more content records.';
    }

    return 'Blog and resource records will appear here once the backend returns admin-visible content data.';
  }

  private getNormalizedStatus(blog: AdminBlog): BlogStatusFilter {
    const status = blog.status?.toLowerCase();

    if (status === 'published' || status === 'active' || blog.isPublished === true) {
      return 'published';
    }

    if (status === 'draft' || status === 'inactive' || status === 'archived' || blog.isPublished === false) {
      return 'draft';
    }

    return 'unknown';
  }

  private getBlogLoadError(err: any): string {
    if (err?.status === 401) {
      return 'Please sign in again to view blogs.';
    }

    if (err?.status === 403) {
      return 'You do not have access to view blogs.';
    }

    return 'Unable to load blogs right now. Please try again later.';
  }
}
