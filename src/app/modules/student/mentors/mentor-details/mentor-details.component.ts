import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap, take } from 'rxjs';
import { CalendlyService } from '../../../../services/calendly/calendly.service';
import { Mentor } from '../../../../services/mentor/mentor.model';
import { MentorService } from '../../../../services/mentor/mentor.service';
import { ToastService } from '../../../../services/toast.service';

declare global {
  interface Window {
    Calendly: any;
  }
}

@Component({
  selector: 'app-mentor-details',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './mentor-details.component.html',
  styleUrls: [ './mentor-details.component.scss' ]
})
export class MentorDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('calendlyContainer', { static: false }) calendlyContainer!: ElementRef<HTMLDivElement>;

  mentor?: Mentor;
  calendlyVerified = false;
  isLoading = true;
  hasError = false;
  isLoadingCalendly = false;
  showCalendlyModal = false;
  private calendlyScriptLoaded = false;

  constructor(
    private mentorService: MentorService,
    private route: ActivatedRoute,
    private calendlyService: CalendlyService,
    private toastService: ToastService
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(params => Number(params.get('id'))),
        filter(id => !isNaN(id) && id > 0),
        switchMap(id => this.mentorService.getMentorById(id)),
        take(1)
      )
      .subscribe({
        next: mentor => {
          this.mentor = mentor;
          this.calendlyVerified = mentor?.calendlyConnected ?? false;
          this.isLoading = false;
        },
        error: err => {
          console.error('Error loading mentor', err);
          this.isLoading = false;
          this.hasError = true;
        }
      });
  }

  ngAfterViewInit(): void {
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

    this.showCalendlyModal = true;
    this.isLoadingCalendly = true;

    document.body.style.overflow = 'hidden'; // prevent background scroll

    this.waitForCalendlyScript().then(() => {
      this.calendlyService.getBookingLink(this.mentor!.userId!).subscribe({
        next: url => {
          if (!this.calendlyContainer) {
            console.error('Calendly container not found');
            this.isLoadingCalendly = false;
            return;
          }

          // Clear previous widget
          this.calendlyContainer.nativeElement.innerHTML = '';

          // Init widget full size
          window.Calendly.initInlineWidget({
            url,
            parentElement: this.calendlyContainer.nativeElement,
            prefill: {},
            utm: {}
          });

          this.isLoadingCalendly = false;
        },
        error: err => {
          console.error('Error fetching booking link', err);
          this.isLoadingCalendly = false;
          this.toastService.show('Unable to load scheduling link. Please try again later.', { classname: 'bg-soft-danger text-dark' });
        }
      });
    });
  }

  closeCalendlyModal(): void {
    this.showCalendlyModal = false;
    document.body.style.overflow = ''; // restore scroll

    if (this.calendlyContainer) {
      this.calendlyContainer.nativeElement.innerHTML = '';
    }
  }
}
