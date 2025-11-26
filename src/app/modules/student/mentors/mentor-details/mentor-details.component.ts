import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap, take } from 'rxjs';
import { CalendlyService } from "../../../../services/calendly/calendly.service";
import { Mentor } from '../../../../services/mentor/mentor.model';
import { MentorService } from '../../../../services/mentor/mentor.service';
import { ToastService } from "../../../../services/toast.service";

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

  mentor?: Mentor;
  calendlyVerified: boolean = false;

  isLoading = true;
  hasError = false;

  constructor(
    private mentorService: MentorService,
    private route: ActivatedRoute,
    private calendlyService: CalendlyService,
    private toastService: ToastService
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(map(params => Number(params.get('id'))),
        filter(id => !isNaN(id) && id > 0),
        switchMap(id => this.mentorService.getMentorById(id)),
        take(1)
      ).subscribe({
        next: mentor => {
          this.mentor = mentor;
          this.calendlyVerified = mentor?.calendlyConnected ?? false;

          this.isLoading = false;
        },
        error: err => {
          this.isLoading = false;
          this.hasError = true;
        }
      }
    );
  }

  ngAfterViewInit(): void {
    const checkCalendly = setInterval(() => {
      if ((window as any).Calendly && (window as any).Calendly.initPopupWidget) {
        clearInterval(checkCalendly);
      }
    }, 500);
  }

  openCalendlyPopup(): void {
    if (!this.mentor) {
      this.toastService.show('Mentor data is not available at the moment. Please try again.', {
        classname: 'bg-soft-warning text-dark'
      });
      return;
    }

    this.calendlyService.getSchedulingLink(this.mentor.userId!).subscribe({
      next: (calendlyUrl) => {
        if ((window as any).Calendly?.initPopupWidget) {
          (window as any).Calendly.initPopupWidget({ url: calendlyUrl });
        } else {
          this.toastService.show(
            'Calendly widget is not ready yet. Opening the link in a new tab...',
            { classname: 'bg-soft-warning text-dark', delay: 5000 }
          );
          window.open(calendlyUrl, '_blank');
        }
      },
      error: (err) => {
        this.toastService.show(
          'Oops! We couldn’t load the scheduling link for this mentor. Please try again later.',
          { classname: 'bg-soft-danger text-dark', delay: 5000 }
        );
      }
    });
  }

}
