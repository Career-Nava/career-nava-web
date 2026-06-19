import { NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { UserModel } from '../../../services/user/user.model';
import { SharedModule } from '../../../shared/shared.module';
import { AdminOverview } from '../../../services/admin/admin.model';
import { AdminService } from '../../../services/admin/admin.service';

interface OverviewCard {
  title: string;
  value: number;
  primaryMeta: string;
  secondaryMeta?: string;
  route?: string;
  actionLabel?: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [ NgForOf, NgIf, SharedModule ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit {
  user: UserModel | null = null;
  overview: AdminOverview | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private adminService: AdminService
  ) {
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();

    this.adminService.getOverview().subscribe({
      next: overview => {
        this.overview = overview;
        this.error = null;
        this.loading = false;
      },
      error: err => {
        this.overview = null;
        this.error = this.getOverviewLoadError(err);
        this.loading = false;
      }
    });
  }

  get cards(): OverviewCard[] {
    const overview = this.overview;
    if (!overview) {
      return [];
    }

    return [
      {
        title: 'Mentors',
        value: this.getCount(overview.totalMentors),
        primaryMeta: `${ this.getCount(overview.activeMentors) } active`,
        secondaryMeta: `${ this.getCount(overview.inactiveMentors) } inactive`,
        route: '/admin/mentors',
        actionLabel: 'Open mentors'
      },
      {
        title: 'Sessions',
        value: this.getCount(overview.totalSessions),
        primaryMeta: `${ this.getCount(overview.upcomingSessions) } upcoming`,
        secondaryMeta: `${ this.getCount(overview.completedSessions) } completed / ${ this.getCount(overview.pendingSessions) } pending`,
        route: '/admin/sessions',
        actionLabel: 'Open sessions'
      },
      {
        title: 'Scholarships',
        value: this.getCount(overview.totalScholarships),
        primaryMeta: 'Read-only admin list',
        route: '/admin/scholarships',
        actionLabel: 'Open scholarships'
      },
      {
        title: 'Blogs / Resources',
        value: this.getCount(overview.totalBlogs),
        primaryMeta: 'Read-only admin list',
        route: '/admin/blogs',
        actionLabel: 'Open blogs'
      },
      {
        title: 'Mentees',
        value: this.getCount(overview.totalMentees),
        primaryMeta: `${ this.getCount(overview.totalUsers) } total users`,
        secondaryMeta: 'No mentee management page yet'
      }
    ];
  }

  trackCard(_: number, card: OverviewCard): string {
    return card.title;
  }

  private getCount(value: number | undefined): number {
    return typeof value === 'number' ? value : 0;
  }

  private getOverviewLoadError(err: any): string {
    if (err?.status === 401) {
      return 'Please sign in again to view the admin overview.';
    }

    if (err?.status === 403) {
      return 'You do not have access to view the admin overview.';
    }

    return 'Unable to load the admin overview right now. Please try again later.';
  }
}
