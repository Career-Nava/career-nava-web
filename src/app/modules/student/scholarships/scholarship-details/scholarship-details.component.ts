import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faArrowLeft, faArrowUpRightFromSquare, faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ScholarshipService } from '../../../../services/scholarship/scholarship.service';
import { ScholarshipDto } from '../../../../services/scholarship/shcolarship.model';
import { ToastService } from '../../../../services/toast.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-scholarship-details',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './scholarship-details.component.html',
  styleUrls: [ './scholarship-details.component.scss' ]
})
export class ScholarshipDetailsComponent implements OnInit, OnDestroy {

  scholarship?: ScholarshipDto;
  isLoading = true;
  loadFailed = false;
  private subs = new Subscription();

  constructor(
    private scholarshipService: ScholarshipService,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {
  }

  ngOnInit(): void {
    this.subs.add(
      this.route.paramMap.subscribe(params => {
        const id = Number(params.get('id'));
        if (id) {
          this.fetchScholarship(id);
          return;
        }

        this.scholarship = undefined;
        this.isLoading = false;
        this.loadFailed = true;
      })
    );
  }

  private fetchScholarship(id: number): void {
    this.isLoading = true;
    this.loadFailed = false;

    this.subs.add(
      this.scholarshipService.getScholarshipById(id).subscribe({
        next: data => {
          this.scholarship = data;
          this.isLoading = false;
        },
        error: () => {
          this.scholarship = undefined;
          this.isLoading = false;
          this.loadFailed = true;
          this.toast.show('Failed to load scholarship details', {
            classname: 'bg-danger text-light',
            delay: 4000
          });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  protected readonly faClock = faClock;
  protected readonly faCalendar = faCalendar;
  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faArrowUpRightFromSquare = faArrowUpRightFromSquare;

  get backLink(): string {
    return this.route.snapshot.pathFromRoot.some(route => route.routeConfig?.path === 'admin')
      ? '/admin/scholarships'
      : '/mentee/scholarships';
  }
}
