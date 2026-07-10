import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { faArrowLeft, faFloppyDisk, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { finalize, Subscription } from 'rxjs';
import { AdminCalendlyEventTypeDetail } from '../../../services/calendly/calendly.model';
import { CalendlyService } from '../../../services/calendly/calendly.service';
import { AdminMentor } from '../../../services/mentor/mentor.model';
import { MentorService } from '../../../services/mentor/mentor.service';
import { ToastService } from '../../../services/toast.service';
import { getUserErrorMessage } from '../../../services/user-error-message';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-admin-event-type-detail',
  standalone: true,
  imports: [ DatePipe, NgClass, NgForOf, NgIf, SharedModule ],
  templateUrl: './event-type-detail.component.html',
  styleUrl: './event-type-detail.component.scss'
})
export class AdminEventTypeDetailComponent implements OnInit, OnDestroy {
  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faRotateRight = faRotateRight;

  eventType: AdminCalendlyEventTypeDetail | null = null;
  mentors: AdminMentor[] = [];
  loading = true;
  mentorsLoading = false;
  savingAssignment = false;
  savingPricing = false;
  error: string | null = null;
  mentorsError: string | null = null;
  private eventTypeId = 0;
  private readonly subs = new Subscription();

  assignmentForm: FormGroup = this.fb.group({
    mentorProfileId: [ '' ]
  });

  pricingForm: FormGroup = this.fb.group({
    isFreeSession: [ true, Validators.required ],
    priceAmount: [ null ],
    priceCurrency: [ 'KES', Validators.required ]
  });

  constructor(
    private route: ActivatedRoute,
    private calendlyService: CalendlyService,
    private mentorService: MentorService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.eventTypeId = Number(this.route.snapshot.paramMap.get('eventTypeId'));
    this.loadMentors();
    this.loadEventType();
    this.subs.add(this.pricingForm.get('isFreeSession')!.valueChanges.subscribe(value => this.applyPricingMode(value === true)));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadEventType(): void {
    if (!this.eventTypeId) {
      this.error = 'The event type route is missing or invalid.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.calendlyService.getAdminEventTypeById(this.eventTypeId).subscribe({
      next: eventType => {
        this.eventType = eventType;
        this.error = null;
        this.loading = false;
        this.patchForms(eventType);
      },
      error: err => { this.eventType = null; this.error = this.getLoadError(err); this.loading = false; }
    });
  }

  loadMentors(): void {
    this.mentorsLoading = true;
    this.mentorService.getAdminMentors()
      .pipe(finalize(() => this.mentorsLoading = false))
      .subscribe({
        next: mentors => {
          this.mentors = mentors.filter(mentor => this.isActiveMentor(mentor));
          this.mentorsError = null;
        },
        error: err => {
          this.mentors = [];
          this.mentorsError = this.getMentorLoadError(err);
        }
      });
  }

  saveAssignment(): void {
    if (!this.eventType) return;

    this.savingAssignment = true;
    const mentorProfileId = this.toNumber(this.assignmentForm.value.mentorProfileId);

    this.calendlyService.updateAdminEventTypeAssignment(this.eventType.eventTypeId, { mentorProfileId })
      .pipe(finalize(() => this.savingAssignment = false))
      .subscribe({
        next: eventType => this.afterMutation('Event type assignment updated.', eventType),
        error: err => this.toast.error(getUserErrorMessage(err, 'Unable to update event type assignment.'), { title: 'Assignment update failed' })
      });
  }

  savePricing(): void {
    if (!this.eventType) return;

    this.applyPricingMode(this.pricingForm.value.isFreeSession === true);
    if (this.pricingForm.invalid) {
      this.pricingForm.markAllAsTouched();
      return;
    }

    const raw = this.pricingForm.getRawValue();
    const isFreeSession = raw.isFreeSession === true;
    const amount = isFreeSession ? null : this.toNumber(raw.priceAmount);

    if (!isFreeSession && (!amount || amount <= 0)) {
      this.pricingForm.get('priceAmount')?.setErrors({ min: true });
      this.pricingForm.markAllAsTouched();
      return;
    }

    this.savingPricing = true;

    this.calendlyService.updateAdminEventTypePricing(this.eventType.eventTypeId, {
      isFreeSession,
      priceAmount: amount,
      priceCurrency: raw.priceCurrency || 'KES'
    })
      .pipe(finalize(() => this.savingPricing = false))
      .subscribe({
        next: eventType => this.afterMutation('Event type pricing updated.', eventType),
        error: err => this.toast.error(getUserErrorMessage(err, 'Unable to update event type pricing.'), { title: 'Pricing update failed' })
      });
  }

  trackMentor(_: number, mentor: AdminMentor): number | string { return mentor.mentorProfileId ?? mentor.email ?? mentor.fullName ?? _; }

  formatPrice(eventType: AdminCalendlyEventTypeDetail): string {
    if (eventType.isFreeSession) return 'Free';
    const amount = typeof eventType.priceAmount === 'number'
      ? eventType.priceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '-';
    return `${ amount } ${ eventType.priceCurrency || '' }`.trim();
  }

  formatDuration(eventType: AdminCalendlyEventTypeDetail): string {
    return eventType.durationMinutes ? `${ eventType.durationMinutes } min` : '-';
  }

  getMentorLabel(eventType: AdminCalendlyEventTypeDetail): string {
    return eventType.mentor?.fullName || eventType.mentor?.email || 'Unassigned';
  }

  getProviderStatusBadgeClass(status?: string | null): string {
    const normalized = this.normalize(status);
    if (normalized === 'active') return 'admin-badge--success';
    if (normalized === 'inactive') return 'admin-badge--muted';
    return 'admin-badge--info';
  }

  getPricingMode(): string {
    return this.pricingForm.value.isFreeSession === true ? 'free' : 'paid';
  }

  private patchForms(eventType: AdminCalendlyEventTypeDetail): void {
    this.assignmentForm.patchValue({
      mentorProfileId: eventType.mentor?.mentorProfileId ?? ''
    }, { emitEvent: false });
    this.pricingForm.patchValue({
      isFreeSession: eventType.isFreeSession === true,
      priceAmount: eventType.priceAmount ?? null,
      priceCurrency: eventType.priceCurrency || 'KES'
    }, { emitEvent: false });
    this.applyPricingMode(eventType.isFreeSession === true);
  }

  private applyPricingMode(isFreeSession: boolean): void {
    const amountControl = this.pricingForm.get('priceAmount');
    const currencyControl = this.pricingForm.get('priceCurrency');
    if (!amountControl || !currencyControl) return;

    if (isFreeSession) {
      amountControl.clearValidators();
      amountControl.setValue(null, { emitEvent: false });
      amountControl.disable({ emitEvent: false });
    } else {
      amountControl.enable({ emitEvent: false });
      amountControl.setValidators([ Validators.required, Validators.min(0.01) ]);
      currencyControl.setValidators([ Validators.required ]);
    }

    amountControl.updateValueAndValidity({ emitEvent: false });
    currencyControl.updateValueAndValidity({ emitEvent: false });
  }

  private afterMutation(message: string, eventType: AdminCalendlyEventTypeDetail): void {
    this.eventType = eventType;
    this.patchForms(eventType);
    this.toast.success(message, { title: 'Event type updated' });
  }

  private isActiveMentor(mentor: AdminMentor): boolean {
    return mentor.isActive === true && (mentor.mentorProfileStatus || '').toLowerCase() === 'active' && !!mentor.mentorProfileId;
  }

  private toNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private normalize(value?: string | null): string {
    return (value || '').toLowerCase();
  }

  private getLoadError(err: any): string {
    if (err?.status === 401) return 'Please sign in again to view this event type.';
    if (err?.status === 403) return 'Only admins can view event type detail.';
    if (err?.status === 404) return 'Event type was not found.';
    return 'Unable to load this event type right now.';
  }

  private getMentorLoadError(err: any): string {
    if (err?.status === 401) return 'Please sign in again to load mentor options.';
    if (err?.status === 403) return 'Only admins can load mentor options.';
    return 'Unable to load active mentor options.';
  }

}
