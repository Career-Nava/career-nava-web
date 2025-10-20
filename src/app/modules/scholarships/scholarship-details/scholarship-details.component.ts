import { Component } from '@angular/core';
import { ScholarshipsService } from '../../../services/scholarships/scholarships.service';
import { IScholarships } from '../../../services/scholarships/IScholarships';
import { SharedModule } from '../../../shared/shared/shared.module';
import { ActivatedRoute } from '@angular/router';
import { faBookBookmark, faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-scholarship-details',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './scholarship-details.component.html',
  styleUrl: './scholarship-details.component.scss'
})
export class ScholarshipDetailsComponent {
  faCalendar = faCalendar;
  faClock = faClock;
  faBookmark = faBookBookmark;

  scholarship?: IScholarships;

  constructor(
    private scholarshipsService: ScholarshipsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.scholarshipsService.getScholarshipById(id).subscribe({
      next: (data) => {
        this.scholarship = data;
        console.log('Loaded scholarship:', this.scholarship);
      },
      error: (err) => {
        console.error('Error loading scholarship by id:', err);
      }
    });
  }
}
