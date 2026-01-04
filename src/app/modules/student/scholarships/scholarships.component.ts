import { Component, OnDestroy, OnInit } from '@angular/core';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import { faBookmark, faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ScholarshipService } from '../../../services/scholarship/scholarship.service';
import { ScholarshipDto } from '../../../services/scholarship/shcolarship.model';
import { ToastService } from '../../../services/toast.service';
import { SharedModule } from '../../../shared/shared.module';

type Tab = 'all' | 'bookmarked' | 'active' | 'inactive';

@Component({
  selector: 'app-scholarships',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './scholarships.component.html',
  styleUrls: [ './scholarships.component.scss' ]
})
export class ScholarshipsComponent implements OnInit, OnDestroy {
  faCalendar = faCalendar;
  faBookmarkSolid = faBookmark;
  faBookmarkRegular = faBookmarkRegular;

  tabs: { label: string; value: Tab }[] = [
    { label: 'All', value: 'all' },
    { label: 'Bookmarked', value: 'bookmarked' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  selectedTab: Tab = 'all';
  searchTerm = '';

  scholarships: ScholarshipDto[] = [];
  private subs = new Subscription();

  constructor(
    private scholarshipService: ScholarshipService,
    private toast: ToastService
  ) {
  }

  ngOnInit(): void {
    this.fetchScholarships();
  }

  /** Derived list used by template */
  get visibleScholarships(): ScholarshipDto[] {
    return this.scholarships
      .filter(s => this.matchesTab(s))
      .filter(s => this.matchesSearch(s));
  }

  setTab(tab: Tab): void {
    this.selectedTab = tab;
  }

  onSearch(value: string): void {
    this.searchTerm = value.toLowerCase().trim();
  }

  toggleBookmark(s: ScholarshipDto): void {
    const prev = s.isBookmarked;
    s.isBookmarked = !prev;

    this.scholarshipService
      .updateBookmark(s.scholarshipId, s.isBookmarked)
      .subscribe({
        next: () =>
          this.toast.show(
            s.isBookmarked
              ? `${ s.title } bookmarked`
              : `${ s.title } removed from bookmarks`,
            {
              classname: s.isBookmarked
                ? 'bg-success text-light'
                : 'bg-secondary text-light',
              delay: 2500
            }
          ),
        error: () => {
          s.isBookmarked = prev; // rollback
          this.toast.show('Bookmark update failed', {
            classname: 'bg-danger text-light',
            delay: 4000
          });
        }
      });
  }

  private fetchScholarships(): void {
    this.subs.add(
      this.scholarshipService.getAllScholarships().subscribe({
        next: data => (this.scholarships = data),
        error: () =>
          this.toast.show('Failed to load scholarships', {
            classname: 'bg-danger text-light',
            delay: 4000
          })
      })
    );
  }

  private matchesTab(s: ScholarshipDto): boolean {
    switch (this.selectedTab) {
      case 'bookmarked':
        return s.isBookmarked;
      case 'active':
        return s.status === 'active';
      case 'inactive':
        return s.status === 'inactive';
      default:
        return true;
    }
  }

  private matchesSearch(s: ScholarshipDto): boolean {
    if (!this.searchTerm) return true;

    return (
      s.title.toLowerCase().includes(this.searchTerm) ||
      s.category?.toLowerCase().includes(this.searchTerm) ||
      s.shortDescription?.toLowerCase().includes(this.searchTerm)
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  protected readonly faClock = faClock;
}
