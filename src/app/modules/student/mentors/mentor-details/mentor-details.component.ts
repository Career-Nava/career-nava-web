import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faArrowLeft, faArrowUpRightFromSquare, faBriefcase, faCalendarCheck, faComments, faGlobe, faStar } from '@fortawesome/free-solid-svg-icons';
import { map, Subscription } from 'rxjs';
import { AuthService } from '../../../../services/auth/auth.service';
import { CalendlyService } from '../../../../services/calendly/calendly.service';
import { AdminMentor, Mentor, MentorSelfProfile } from '../../../../services/mentor/mentor.model';
import { MentorService } from '../../../../services/mentor/mentor.service';
import { ToastService } from '../../../../services/toast.service';
import { SharedModule } from '../../../../shared/shared.module';

declare global {
  interface Window {
    Calendly: any;
  }
}

@Component({
  selector: 'app-mentor-details',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './mentor-details.component.html',
  styleUrls: [ './mentor-details.component.scss' ]
})
export class MentorDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('calendlyContainer', { static: false }) calendlyContainer!: ElementRef<HTMLDivElement>;

  mentor?: Mentor;
  calendlyVerified = false;
  isLoading = true;
  hasError = false;
  isLoadingCalendly = false;
  showCalendlyModal = false;
  isAdminPreview = false;
  isMentorPreview = false;
  adminPreviewStatus = '';
  adminPreviewAccountActive = true;
  private calendlyScriptLoaded = false;
  private subs = new Subscription();

  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;
  protected readonly faBriefcase = faBriefcase;
  protected readonly faComments = faComments;
  protected readonly faStar = faStar;
  protected readonly faCalendarCheck = faCalendarCheck;
  protected readonly faGlobe = faGlobe;

  constructor(
    private mentorService: MentorService,
    private route: ActivatedRoute,
    private calendlyService: CalendlyService,
    private toastService: ToastService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.isAdminPreview = this.isAdminRoute();
    this.isMentorPreview = this.isMentorPreviewRoute();

    if (this.isMentorPreview) {
      this.fetchSelfPreview();
      return;
    }

    this.subs.add(
      this.route.paramMap.subscribe(params => {
        const id = Number(params.get('id'));
        if (id > 0) {
          this.fetchMentor(id);
          return;
        }

        this.mentor = undefined;
        this.isLoading = false;
        this.hasError = true;
      })
    );
  }

  private fetchMentor(id: number): void {
    this.isLoading = true;
    this.hasError = false;

    this.subs.add(
      this.getMentorForRoute(id).subscribe({
        next: mentor => {
          this.mentor = mentor;
          this.calendlyVerified = mentor?.calendlyConnected ?? false;
          this.isLoading = false;
        },
        error: err => {
          console.error('Error loading mentor', err);
          this.mentor = undefined;
          this.isLoading = false;
          this.hasError = true;
        }
      })
    );
  }

  getExpertiseTags(limit = 4): string[] {
    return (this.mentor?.expertise ?? [])
      .map(item => item.expertiseName)
      .filter((item): item is string => !!item)
      .slice(0, limit);
  }

  getDisciplineTags(limit = 4): string[] {
    return (this.mentor?.disciplines ?? [])
      .map(item => item.disciplineName)
      .filter((item): item is string => !!item)
      .slice(0, limit);
  }

  getFluencyTags(limit = 4): string[] {
    return (this.mentor?.fluency ?? [])
      .map(item => item.fluencyName)
      .filter((item): item is string => !!item)
      .slice(0, limit);
  }

  get backLink(): string {
    if (this.isMentorPreview) {
      return '/mentor/profile';
    }

    return this.isAdminPreview
      ? '/admin/mentors'
      : '/mentee/mentors';
  }

  get adminPreviewVisibilityMessage(): string | null {
    if (!this.isAdminPreview) return null;
    const status = (this.adminPreviewStatus || 'draft').toLowerCase();
    if (this.adminPreviewAccountActive && status === 'active') return null;
    if (!this.adminPreviewAccountActive) return 'Account inactive - this mentor is not visible to mentees.';
    return `${ status.charAt(0).toUpperCase() + status.slice(1) } profile - not visible to mentees.`;
  }

  get mentorPreviewVisibilityMessage(): string | null {
    if (!this.isMentorPreview) return null;
    const status = (this.adminPreviewStatus || 'draft').toLowerCase();
    if (this.adminPreviewAccountActive && status === 'active') {
      return 'This is how mentees can see your profile.';
    }

    if (!this.adminPreviewAccountActive) {
      return 'This is a preview only. Your account is inactive, so mentees cannot discover your profile.';
    }

    return 'This is a preview only. Your profile is not currently public to mentees.';
  }

  getLinkedInUrl(mentor: Mentor): string | null {
    const url = (mentor.linkedInUrl ?? (mentor as Mentor & { linkedIn?: string | null }).linkedIn ?? '').trim();
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    if (/^(www\.)?linkedin\.com\//i.test(url)) return `https://${ url }`;
    return null;
  }

  private waitForCalendlyScript(): Promise<void> {
    if (this.calendlyScriptLoaded) return Promise.resolve();

    return new Promise(resolve => {
      if (window.Calendly) {
        this.calendlyScriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => {
        this.calendlyScriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        this.toastService.show('Failed to load Calendly script', { classname: 'bg-soft-danger text-dark' });
        resolve();
      };
      document.body.appendChild(script);
    });
  }

  openCalendlyModal(): void {
    if (!this.mentor) return;
    if (this.isAdminPreview || this.isMentorPreview) {
      this.toastService.show(
        this.isAdminPreview ? 'Booking is disabled in admin preview.' : 'Booking is disabled in mentor preview.',
        { classname: 'bg-soft-warning text-dark' }
      );
      return;
    }

    const user = this.authService.getUser();
    if (!user) {
      this.toastService.show('You must be logged in to book a session.', { classname: 'bg-soft-warning text-dark' });
      return;
    }

    this.showCalendlyModal = true;
    this.isLoadingCalendly = true;
    document.body.style.overflow = 'hidden';

    window.setTimeout(() => {
      this.waitForCalendlyScript().then(() => {
        if (!window.Calendly?.initInlineWidget || !this.calendlyContainer) {
          this.isLoadingCalendly = false;
          this.toastService.show('Unable to load scheduling right now. Please try again later.', { classname: 'bg-soft-danger text-dark' });
          this.closeCalendlyModal();
          return;
        }

        this.calendlyService.getBookingLink(this.mentor!.userId!).subscribe({
          next: url => {
            this.calendlyContainer.nativeElement.innerHTML = '';
            window.Calendly.initInlineWidget({
              url,
              parentElement: this.calendlyContainer.nativeElement,
              prefill: {
                name: `${ user.fullName }`,
                email: user.email,
              },
              readOnly: {
                email: true
              },
              utm: {}
            });

            this.isLoadingCalendly = false;
          },
          error: err => {
            console.warn('Error fetching booking link: ', err.error?.message ?? err);
            this.isLoadingCalendly = false;
            this.toastService.show('Unable to load scheduling link. Please try again later.', { classname: 'bg-soft-danger text-dark' });
            this.closeCalendlyModal();
          }
        });
      });
    });
  }

  closeCalendlyModal(): void {
    this.showCalendlyModal = false;
    document.body.style.overflow = '';

    if (this.calendlyContainer) {
      this.calendlyContainer.nativeElement.innerHTML = '';
    }
  }

  ngOnDestroy(): void {
    this.closeCalendlyModal();
    this.subs.unsubscribe();
  }

  private getMentorForRoute(id: number) {
    if (!this.isAdminPreview) return this.mentorService.getMentorById(id);
    return this.mentorService.getAdminMentorById(id).pipe(map(mentor => this.mapAdminMentorToPreview(mentor)));
  }

  private fetchSelfPreview(): void {
    this.isLoading = true;
    this.hasError = false;

    this.subs.add(
      this.mentorService.getSelfProfile().subscribe({
        next: profile => {
          this.mentor = this.mapSelfProfileToPreview(profile);
          this.calendlyVerified = profile.calendlyConnected ?? false;
          this.isLoading = false;
        },
        error: () => {
          this.mentor = undefined;
          this.isLoading = false;
          this.hasError = true;
        }
      })
    );
  }

  private mapAdminMentorToPreview(mentor: AdminMentor): Mentor {
    this.adminPreviewStatus = mentor.mentorProfileStatus || (mentor.isActive ? 'active' : 'inactive');
    this.adminPreviewAccountActive = mentor.isActive === true;

    return {
      userId: mentor.userId,
      mentorProfileId: mentor.mentorProfileId,
      fullName: mentor.fullName,
      email: mentor.email,
      role: mentor.role,
      isActive: mentor.isActive,
      calendlyConnected: mentor.calendlyConnected === true,
      company: mentor.company,
      positionTitle: mentor.positionTitle ?? mentor.title,
      linkedInUrl: mentor.linkedInUrl ?? mentor.linkedIn,
      avgRating: mentor.avgRating ?? mentor.rating ?? 0,
      totalReviews: mentor.totalReviews ?? 0,
      totalSessions: mentor.totalSessions ?? 0,
      bio: mentor.bio,
      profilePicture: mentor.profilePicture,
      expertise: mentor.expertise ?? [],
      disciplines: mentor.disciplines ?? [],
      fluency: mentor.fluency ?? [],
      experiences: mentor.experiences ?? []
    };
  }

  private mapSelfProfileToPreview(profile: MentorSelfProfile): Mentor {
    this.adminPreviewStatus = profile.mentorProfileStatus || (profile.isActive ? 'active' : 'inactive');
    this.adminPreviewAccountActive = profile.isActive === true;

    return {
      userId: profile.userId,
      mentorProfileId: profile.mentorProfileId,
      fullName: profile.fullName,
      email: profile.email,
      role: profile.role,
      isActive: profile.isActive,
      calendlyConnected: profile.calendlyConnected === true,
      company: profile.company,
      positionTitle: profile.positionTitle,
      linkedInUrl: profile.linkedInUrl,
      avgRating: profile.avgRating ?? 0,
      totalReviews: profile.totalReviews ?? 0,
      totalSessions: profile.totalSessions ?? 0,
      bio: profile.bio,
      profilePicture: profile.profilePicture,
      expertise: profile.expertise ?? [],
      disciplines: profile.disciplines ?? [],
      fluency: profile.fluency ?? [],
      experiences: profile.experiences ?? []
    };
  }

  private isAdminRoute(): boolean {
    return this.route.snapshot.pathFromRoot.some(route => route.routeConfig?.path === 'admin');
  }

  private isMentorPreviewRoute(): boolean {
    return this.route.snapshot.routeConfig?.path === 'profile/preview';
  }
}
