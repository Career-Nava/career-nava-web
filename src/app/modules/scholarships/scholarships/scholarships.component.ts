import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared/shared.module';
import { IScholarships } from '../../../services/scholarships/IScholarships';
import { ScholarshipsService } from '../../../services/scholarships/scholarships.service';
import { faBookmark, faCalendar, faClock, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-scholarships',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './scholarships.component.html',
  styleUrl: './scholarships.component.scss'
})
export class ScholarshipsComponent {
  faCalendar = faCalendar;
  faClock = faClock;
  faDotVertical = faEllipsisV;
  faBookmarkSolid = faBookmark;
  faBookmarkRegular = faBookmarkRegular;

  isBookmarked = false;
  selectedTab: 'all' | 'bookmarked' | 'active' | 'inactive' = 'all';

  private subscriptions: Subscription = new Subscription();
  
  scholarships: IScholarships[] = [];

  constructor(private scholarshipsService: ScholarshipsService, private toastService: ToastService) {
  }
  
  ngOnInit(): void {
    this.loadScholarships();
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  private loadScholarships(): void {
    this.subscriptions.add(this.scholarshipsService.getScholarships().subscribe({
      next: (s) => {
        this.scholarships = s;
        console.log('Scholarships:', this.scholarships);
      },
      error: (e) => console.error('Failed to load scholarships', e)
    }));
  }

  toogleBookmark(scholarship: IScholarships) {
    scholarship.isBookmarked = !scholarship.isBookmarked;

    // call service to update (simulated or real)
  this.scholarshipsService.updateBookmark(scholarship.id, scholarship.isBookmarked)
    .subscribe({
      next: () => {
        const msg = scholarship.isBookmarked
          ? `${scholarship.title} has been bookmarked.`
          : `${scholarship.title} has been removed from bookmarks.`;

        // show toast:
        this.toastService.show(msg, {
          classname: scholarship.isBookmarked ? 'bg-success text-light' : 'bg-secondary text-light',
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

  setTab(tab: 'all' | 'bookmarked' | 'active' | 'inactive') {
    this.selectedTab = tab;
  }

  get filteredScholarships() {
    switch (this.selectedTab) {
      case 'bookmarked':
        return this.scholarships.filter(s => s.isBookmarked);
      case 'active':
        return this.scholarships.filter(s => s.status === 'active');
      case 'inactive':
        return this.scholarships.filter(s => s.status === 'inactive');
      default:
        return this.scholarships;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Clean up the subscription
  }
}
