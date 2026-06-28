import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faEye, faFilter, faPen, faPlus, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { finalize, of, switchMap } from 'rxjs';
import { AdminBlog, AdminBlogUpsert } from '../../../services/blog/blog.model';
import { BlogService } from '../../../services/blog/blog.service';
import { ToastService } from '../../../services/toast.service';
import { SharedModule } from '../../../shared/shared.module';

type BlogStatusFilter = 'all' | 'published' | 'draft' | 'archived' | 'unknown';
type BlogMode = 'none' | 'detail' | 'edit' | 'create';

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
  protected readonly faFilter = faFilter;
  protected readonly faPen = faPen;
  protected readonly faRotateRight = faRotateRight;

  blogs: AdminBlog[] = [];
  selectedBlog: AdminBlog | null = null;
  loading = true;
  saving = false;
  error: string | null = null;
  actionError: string | null = null;
  actionMessage: string | null = null;
  mode: BlogMode = 'none';

  searchQuery = '';
  statusFilter: BlogStatusFilter = 'all';
  filtersExpanded = false;

  blogForm: FormGroup = this.fb.group({
    authorId: [ null ],
    title: [ '', Validators.required ],
    slug: [ '' ],
    coverImage: [ '' ],
    blockQuote: [ '', Validators.required ],
    category: [ 'General' ],
    readingTime: [ '' ],
    status: [ 'draft', Validators.required ],
    contents: this.fb.array([])
  });

  constructor(private blogService: BlogService, private fb: FormBuilder, private toast: ToastService) {}

  ngOnInit(): void { this.loadBlogs(); }

  get contents(): FormArray { return this.blogForm.get('contents') as FormArray; }
  get totalBlogs(): number { return this.blogs.length; }
  get publishedBlogs(): number { return this.blogs.filter(b => this.normalizeStatus(b.status) === 'published').length; }
  get draftBlogs(): number { return this.blogs.filter(b => [ 'draft', 'archived' ].includes(this.normalizeStatus(b.status))).length; }
  get filteredCount(): number { return this.filteredBlogs.length; }

  loadBlogs(): void {
    this.loading = true;
    this.blogService.getAdminBlogs().subscribe({
      next: blogs => { this.blogs = blogs; this.error = null; this.loading = false; },
      error: err => { this.blogs = []; this.error = this.getLoadError(err); this.loading = false; }
    });
  }

  get filteredBlogs(): AdminBlog[] {
    const query = this.searchQuery.trim().toLowerCase();
    return this.blogs.filter(blog => {
      const status = this.normalizeStatus(blog.status);
      if (this.statusFilter !== 'all' && status !== this.statusFilter) return false;
      if (!query) return true;
      return [ blog.title, blog.slug, blog.category, blog.authorName, blog.readingTime, blog.status ].filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  }

  trackBlog(index: number, blog: AdminBlog): number | string { return blog.blogId ?? blog.slug ?? blog.title ?? index; }
  onSearch(value: string): void { this.searchQuery = value; }
  toggleFilters(): void { this.filtersExpanded = !this.filtersExpanded; }
  onStatusChange(value: string): void { this.statusFilter = value as BlogStatusFilter; }

  openCreate(): void {
    this.mode = 'create';
    this.selectedBlog = null;
    this.actionError = null;
    this.actionMessage = null;
    this.blogForm.reset({ category: 'General', status: 'draft' });
    this.contents.clear();
    this.addContentBlock();
  }

  viewBlog(blog: AdminBlog): void {
    if (!blog.blogId) return;
    this.mode = 'detail';
    this.actionError = null;
    this.blogService.getAdminBlogById(blog.blogId).subscribe({
      next: detail => this.selectedBlog = detail,
      error: err => this.actionError = this.getActionError(err, 'Unable to load blog detail.')
    });
  }

  editBlog(blog: AdminBlog): void {
    if (!blog.blogId) return;
    this.mode = 'edit';
    this.blogService.getAdminBlogById(blog.blogId).subscribe({
      next: detail => { this.selectedBlog = detail; this.patchForm(detail); },
      error: err => this.actionError = this.getActionError(err, 'Unable to load blog detail.')
    });
  }

  saveBlog(): void {
    if (this.blogForm.invalid) { this.blogForm.markAllAsTouched(); return; }
    const payload = this.buildPayload();
    const request = this.mode === 'edit' && this.selectedBlog?.blogId
      ? this.blogService.updateAdminBlog(this.selectedBlog.blogId, payload)
      : this.blogService.createAdminBlog(payload);
    this.saving = true;
    request
      .pipe(
        switchMap(blog => this.applyBlogStatus(blog, payload.status || 'draft')),
        finalize(() => this.saving = false)
      )
      .subscribe({
      next: blog => this.afterMutation(this.mode === 'edit' ? 'Resource updated.' : 'Resource created.', blog),
      error: err => this.actionError = this.getActionError(err, 'Unable to save resource.')
    });
  }

  addContentBlock(value = ''): void { this.contents.push(this.fb.group({ contentOrder: [ this.contents.length + 1 ], contentText: [ value ] })); }
  removeContentBlock(index: number): void { this.contents.removeAt(index); }
  closePanel(): void { this.mode = 'none'; this.selectedBlog = null; this.actionError = null; this.actionMessage = null; }

  getStatusLabel(blog: AdminBlog): string { return blog.status || 'Unknown'; }
  getContentBlockCount(blog: AdminBlog): string { return `${ blog.contentBlockCount ?? blog.contents?.length ?? 0 }`; }
  canPreviewBlog(blog: AdminBlog): boolean { return !!blog.slug && this.normalizeStatus(blog.status) === 'published'; }
  showPreviewUnavailable(): void {
    this.toast.show('Publish this resource before public preview.', {
      classname: 'bg-warning text-dark',
      delay: 3500
    });
  }
  getStatusBadgeClass(blog: AdminBlog): string {
    const status = this.normalizeStatus(blog.status);
    if (status === 'published') return 'admin-badge--success';
    if (status === 'archived') return 'admin-badge--danger';
    if (status === 'draft') return 'admin-badge--warning';
    return 'admin-badge--muted';
  }
  getEmptyTitle(): string { return this.searchQuery || this.statusFilter !== 'all' ? 'No resources match the current filters' : 'No blogs or resources found'; }
  getEmptyMessage(): string { return this.searchQuery || this.statusFilter !== 'all' ? 'Try a broader search or switch back to all statuses.' : 'Create a resource to begin building the content library.'; }

  private patchForm(blog: AdminBlog): void {
    this.blogForm.patchValue({
      authorId: blog.authorId ?? null,
      title: blog.title ?? '',
      slug: blog.slug ?? '',
      coverImage: blog.coverImage ?? '',
      blockQuote: blog.blockQuote ?? blog.quote ?? '',
      category: blog.category ?? 'General',
      readingTime: blog.readingTime ?? '',
      status: blog.status ?? 'draft'
    });
    this.contents.clear();
    (blog.contents?.length ? blog.contents : [ { contentOrder: 1, contentText: '' } ]).forEach(c => this.addContentBlock(c.contentText ?? ''));
  }

  private buildPayload(): AdminBlogUpsert {
    const value = this.blogForm.value;
    return { ...value, contents: (value.contents ?? []).map((c: any, i: number) => ({ contentOrder: i + 1, contentText: c.contentText })).filter((c: any) => !!c.contentText?.trim()) };
  }

  private afterMutation(message: string, blog: AdminBlog): void {
    this.actionError = null; this.actionMessage = message; this.selectedBlog = blog; this.mode = 'none';
    this.toast.show(message, { classname: 'bg-success text-light', delay: 3500 });
    this.loadBlogs();
  }
  private applyBlogStatus(blog: AdminBlog, desiredStatus: string) {
    if (!blog.blogId) return of(blog);
    const currentStatus = this.normalizeStatus(blog.status);
    const normalizedDesired = this.normalizeStatus(desiredStatus);
    if (normalizedDesired === 'unknown' || normalizedDesired === currentStatus) return of(blog);
    if (normalizedDesired === 'published') return this.blogService.publishAdminBlog(blog.blogId);
    if (normalizedDesired === 'draft') return this.blogService.moveAdminBlogToDraft(blog.blogId);
    return this.blogService.archiveAdminBlog(blog.blogId);
  }
  private normalizeStatus(status?: string): BlogStatusFilter { const s = status?.toLowerCase(); return s === 'published' || s === 'draft' || s === 'archived' ? s : 'unknown'; }
  private getLoadError(err: any): string { if (err?.status === 401) return 'Please sign in again to view blogs.'; if (err?.status === 403) return 'You do not have access to view blogs.'; return 'Unable to load blogs right now. Please try again later.'; }
  private getActionError(err: any, fallback: string): string { return err?.error?.message || err?.message || fallback; }
}
