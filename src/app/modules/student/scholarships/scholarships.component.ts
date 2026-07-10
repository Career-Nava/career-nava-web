import { Component, OnDestroy, OnInit } from '@angular/core';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import { faArrowRight, faBookmark, faCalendar, faClock, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ScholarshipService } from '../../../services/scholarship/scholarship.service';
import { ScholarshipDto } from '../../../services/scholarship/shcolarship.model';
import { ToastService } from '../../../services/toast.service';
import { getUserErrorMessage } from '../../../services/user-error-message';
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
  faArrowRight = faArrowRight;
  faBookmarkSolid = faBookmark;
  faBookmarkRegular = faBookmarkRegular;
  faMagnifyingGlass = faMagnifyingGlass;
  faClock = faClock;

  tabs: { label: string; value: Tab }[] = [
    { label: 'All', value: 'all' },
    { label: 'Bookmarked', value: 'bookmarked' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  selectedTab: Tab = 'all';
  searchQuery = '';
  isLoading = true;
  bookmarkingScholarshipId: number | null = null;
  readonly skeletonCards = Array.from({ length: 6 });

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

  get isFiltered(): boolean {
    return this.selectedTab !== 'all' || !!this.searchQuery.trim();
  }

  setTab(tab: Tab): void {
    this.selectedTab = tab;
  }

  onSearch(value: string): void {
    this.searchQuery = value;
  }

  resetFilters(): void {
    this.selectedTab = 'all';
    this.searchQuery = '';
  }

  toggleBookmark(s: ScholarshipDto): void {
    if (this.bookmarkingScholarshipId === s.scholarshipId) {
      return;
    }

    const shouldSave = !s.isBookmarked;
    this.bookmarkingScholarshipId = s.scholarshipId;

    const request = shouldSave
      ? this.scholarshipService.saveScholarship(s.scholarshipId)
      : this.scholarshipService.deleteSavedScholarship(s.scholarshipId);

    this.subs.add(
      request.subscribe({
        next: result => {
          s.isBookmarked = result.isBookmarked;
          const message = result.isBookmarked
            ? `${ s.title } bookmarked`
            : `${ s.title } removed from bookmarks`;
          const options = { title: result.isBookmarked ? 'Scholarship saved' : 'Bookmark removed' };
          if (result.isBookmarked) {
            this.toast.success(message, options);
          } else {
            this.toast.neutral(message, options);
          }
          this.bookmarkingScholarshipId = null;
        },
        error: err => {
          this.bookmarkingScholarshipId = null;
          this.toast.error(getUserErrorMessage(err, 'Bookmark update failed. Please try again.'), { title: 'Unable to save bookmark' });
        }
      })
    );
  }

  private fetchScholarships(): void {
    this.isLoading = true;

    this.subs.add(
      this.scholarshipService.getMenteeScholarships().subscribe({
        next: data => {
          this.scholarships = data;
          this.isLoading = false;
        },
        error: err => {
          this.isLoading = false;
          this.toast.error(getUserErrorMessage(err, 'Unable to load scholarships right now. Please try again later.'), { title: 'Scholarships unavailable' });
        }
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
    const searchTerm = this.searchQuery.toLowerCase().trim();
    if (!searchTerm) return true;

    return (
      s.title.toLowerCase().includes(searchTerm) ||
      s.category?.toLowerCase().includes(searchTerm) ||
      s.shortDescription?.toLowerCase().includes(searchTerm)
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
