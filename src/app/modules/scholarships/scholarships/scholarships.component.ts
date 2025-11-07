import { Component, OnDestroy, OnInit } from '@angular/core';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import { faBookmark, faCalendar, faClock, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ScholarshipService } from '../../../services/scholarship/scholarship.service';
import { Scholarship } from '../../../services/scholarship/shcolarship.model';
import { ToastService } from '../../../services/toast.service';
import { SharedModule } from '../../../shared/shared/shared.module';

@Component({
  selector: 'app-scholarships',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './scholarships.component.html',
  styleUrls: [ './scholarships.component.scss' ]
})
export class ScholarshipsComponent implements OnInit, OnDestroy {
  // FontAwesome icons
  faCalendar = faCalendar;
  faClock = faClock;
  faDotVertical = faEllipsisV;
  faBookmarkSolid = faBookmark;
  faBookmarkRegular = faBookmarkRegular;

  // Tabs + State
  selectedTab: string = 'all';
  tabs = [
    { label: 'All', value: 'all' },
    { label: 'Bookmarked', value: 'bookmarked' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  scholarships: Scholarship[] = [];
  private subscriptions = new Subscription();

  constructor(
    private scholarshipsService: ScholarshipService,
    private toastService: ToastService
  ) {
  }

  ngOnInit(): void {
    this.loadScholarships();
  }

  /** 🔹 Fetch all scholarships from backend */
  private loadScholarships(): void {
    this.subscriptions.add(
      this.scholarshipsService.getAllScholarships().subscribe({
        next: (data) => {
          this.scholarships = data;
          console.log('Scholarships loaded:', this.scholarships);
        },
        error: (err) => {
          console.error('Failed to load scholarships:', err);
          this.toastService.show('Failed to load scholarships', {
            classname: 'bg-danger text-light',
            delay: 4000
          });
        }
      })
    );
  }

  /** ⭐ Bookmark toggle — updates local state + service */
  toggleBookmark(scholarship: Scholarship): void {
    scholarship.isBookmarked = !scholarship.isBookmarked;

    this.scholarshipsService.updateBookmark(scholarship.id, scholarship.isBookmarked)
      .subscribe({
        next: () => {
          const msg = scholarship.isBookmarked
            ? `${ scholarship.title } has been bookmarked.`
            : `${ scholarship.title } has been removed from bookmarks.`;

          this.toastService.show(msg, {
            classname: scholarship.isBookmarked
              ? 'bg-success text-light'
              : 'bg-secondary text-light',
            delay: 3000
          });
        },
        error: () => {
          this.toastService.show('Failed to update bookmark.', {
            classname: 'bg-danger text-light',
            delay: 4000
          });
        }
      });
  }

  /** 🔹 Filter list based on selected tab */
  get filteredScholarships(): Scholarship[] {
    switch (this.selectedTab) {
      case 'bookmarked':
        return this.scholarships.filter((s) => s.isBookmarked);
      case 'active':
        return this.scholarships.filter((s) => s.status === 'active');
      case 'inactive':
        return this.scholarships.filter((s) => s.status === 'inactive');
      default:
        return this.scholarships;
    }
  }

  /** 🔹 Helper to get star count for ratings */
  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  /** 🔹 Tab switch handler */
  setTab(tab: string): void {
    this.selectedTab = tab;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
