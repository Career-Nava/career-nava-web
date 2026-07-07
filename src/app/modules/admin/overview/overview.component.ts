import { NgForOf, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCalendarCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { AdminOverview } from '../../../services/admin/admin.model';
import { AdminService } from '../../../services/admin/admin.service';
import { AuthService } from '../../../services/auth/auth.service';
import { UserModel } from '../../../services/user/user.model';
import { SharedModule } from '../../../shared/shared.module';

interface OverviewCard {
  title: string;
  value: number;
  primaryMeta: string;
  secondaryMeta?: string;
  route?: string;
  actionLabel?: string;
}

interface AdminAreaLink {
  title: string;
  description: string;
  route: string;
}

interface AdminStubAction {
  label: string;
  note: string;
  hint: string;
  icon: IconDefinition;
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

  readonly areaLinks: AdminAreaLink[] = [
    {
      title: 'Mentor management',
      description: 'Review mentor readiness, activation state, and scheduling setup.',
      route: '/admin/mentors'
    },
    {
      title: 'Event type management',
      description: 'Review Calendly event types and maintain mentor assignment and pricing metadata.',
      route: '/admin/event-types'
    },
    {
      title: 'Session operations',
      description: 'Track platform sessions booked between mentees and mentors.',
      route: '/admin/sessions'
    },
    {
      title: 'Payment audit',
      description: 'Review backend-owned payment state and linked session context.',
      route: '/admin/payments'
    },
    {
      title: 'Payment event audit',
      description: 'Inspect provider event processing state without mutation controls.',
      route: '/admin/payment-events'
    },
    {
      title: 'Scholarship management',
      description: 'Maintain opportunity inventory and review scholarship visibility.',
      route: '/admin/scholarships'
    },
    {
      title: 'Blogs & resources',
      description: 'Monitor published guidance content and internal content readiness.',
      route: '/admin/blogs'
    }
  ];

  readonly quickActions: AdminStubAction[] = [
    { label: 'Add mentor', note: 'Soon', hint: 'Create flow coming soon', icon: faPlus },
    { label: 'Add scholarship', note: 'Soon', hint: 'Create flow coming soon', icon: faPlus },
    { label: 'Create resource', note: 'Soon', hint: 'Create flow coming soon', icon: faPlus },
    { label: 'Review sessions', note: 'Soon', hint: 'Session review tools coming soon', icon: faCalendarCheck }
  ];

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
        actionLabel: 'Manage mentors'
      },
      {
        title: 'Sessions',
        value: this.getCount(overview.totalSessions),
        primaryMeta: `${ this.getCount(overview.upcomingSessions) } upcoming`,
        secondaryMeta: `${ this.getCount(overview.completedSessions) } completed / ${ this.getCount(overview.pendingSessions) } pending`,
        route: '/admin/sessions',
        actionLabel: 'Review sessions'
      },
      {
        title: 'Scholarships',
        value: this.getCount(overview.totalScholarships),
        primaryMeta: 'Operational inventory',
        secondaryMeta: 'Read-only administration today',
        route: '/admin/scholarships',
        actionLabel: 'Manage scholarships'
      },
      {
        title: 'Blogs & resources',
        value: this.getCount(overview.totalBlogs),
        primaryMeta: 'Content inventory',
        secondaryMeta: 'Read-only administration today',
        route: '/admin/blogs',
        actionLabel: 'Manage resources'
      },
      {
        title: 'Mentees',
        value: this.getCount(overview.totalMentees),
        primaryMeta: `${ this.getCount(overview.totalUsers) } total users`,
        secondaryMeta: 'Dedicated mentee management is not wired yet'
      }
    ];
  }

  get overviewSummary(): string {
    const overview = this.overview;

    if (!overview) {
      return 'Platform activity snapshot';
    }

    return `${ this.getCount(overview.totalUsers) } total users across the platform`;
  }

  get calendlyStatusLabel(): string {
    return this.user?.calendlyConnected ? 'Calendly connected' : 'Calendly not connected';
  }

  get calendlyStatusClass(): string {
    return this.user?.calendlyConnected ? 'admin-badge--success' : 'admin-badge--warning';
  }

  trackCard(_: number, card: OverviewCard): string {
    return card.title;
  }

  trackArea(_: number, area: AdminAreaLink): string {
    return area.route;
  }

  trackAction(_: number, action: AdminStubAction): string {
    return action.label;
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
