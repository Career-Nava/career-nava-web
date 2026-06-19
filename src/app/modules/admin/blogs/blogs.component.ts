import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminBlog } from '../../../services/blog/blog.model';
import { BlogService } from '../../../services/blog/blog.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-admin-blogs',
  standalone: true,
  imports: [ DatePipe, NgClass, NgForOf, NgIf, SharedModule ],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss'
})
export class AdminBlogsComponent implements OnInit {
  blogs: AdminBlog[] = [];
  loading = true;
  error: string | null = null;

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

  trackBlog(index: number, blog: AdminBlog): number | string {
    return blog.blogId ?? blog.slug ?? blog.title ?? index;
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
      return 'text-bg-success-subtle text-success-emphasis';
    }

    if (status === 'draft' || status === 'inactive' || status === 'archived' || blog.isPublished === false) {
      return 'text-bg-secondary text-white';
    }

    return 'text-bg-light text-muted';
  }

  getContentBlockCount(blog: AdminBlog): string {
    return typeof blog.contentBlockCount === 'number' ? `${ blog.contentBlockCount }` : '-';
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
