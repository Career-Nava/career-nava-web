import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faArrowLeft, faArrowUpRightFromSquare, faBriefcase, faCalendarCheck, faComments, faGlobe, faStar } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../services/auth/auth.service';
import { CalendlyService } from '../../../../services/calendly/calendly.service';
import { Mentor } from '../../../../services/mentor/mentor.model';
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
      this.mentorService.getMentorById(id).subscribe({
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
    return this.route.snapshot.pathFromRoot.some(route => route.routeConfig?.path === 'admin')
      ? '/admin/mentors'
      : '/mentee/mentors';
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
}
