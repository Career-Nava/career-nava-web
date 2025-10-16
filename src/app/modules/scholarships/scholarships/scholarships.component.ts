import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared/shared.module';
import { IScholarships } from '../../../services/scholarships/IScholarships';
import { ScholarshipsService } from '../../../services/scholarships/scholarships.service';
import { faCalendar, faClock, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-scholarships',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './scholarships.component.html',
  styleUrl: './scholarships.component.scss'
})
export class ScholarshipsComponent {
faCalendar = faCalendar;
  faClock = faClock;
  faDotVertical = faEllipsisV;

  private subscriptions: Subscription = new Subscription();
  
  scholarships: IScholarships[] = [];

  constructor(private scholarshipsService: ScholarshipsService) {
  }
  
  ngOnInit(): void {
    this.loadScholarships();
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  private loadScholarships(): void {
    this.subscriptions.add(this.scholarshipsService.getScholarships().subscribe({
      next: (s) => {
        this.scholarships = s;
        console.log('Sessions:', this.scholarships);
      },
      error: (e) => console.error('Failed to load scholarships', e)
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Clean up the subscription
  }
}
