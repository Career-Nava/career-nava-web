import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faBookBookmark, faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ScholarshipService } from '../../../services/scholarship/scholarship.service';
import { Scholarship } from '../../../services/scholarship/shcolarship.model';
import { ToastService } from '../../../services/toast.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-scholarship-details',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './scholarship-details.component.html',
  styleUrls: [ './scholarship-details.component.scss' ]
})
export class ScholarshipDetailsComponent implements OnInit, OnDestroy {
  faCalendar = faCalendar;
  faClock = faClock;
  faBookmark = faBookBookmark;

  scholarship?: Scholarship;
  private subscriptions = new Subscription();

  constructor(
    private scholarshipService: ScholarshipService,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadScholarship(id);
  }

  private loadScholarship(id: number): void {
    const sub = this.scholarshipService.getScholarshipById(id).subscribe({
      next: (data) => {
        this.scholarship = data;
        console.log('Loaded scholarship:', this.scholarship);
      },
      error: (err) => {
        console.error('Error loading scholarship by id:', err);
        this.toastService.show('Failed to load scholarship details', {
          classname: 'bg-danger text-light',
          delay: 4000
        });
      }
    });
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
