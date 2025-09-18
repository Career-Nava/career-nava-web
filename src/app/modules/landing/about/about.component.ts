import { Component, OnInit } from '@angular/core';
import { MeetMentorsComponent } from '../../components/meet-mentors/meet-mentors.component';
import { CommonModule } from '@angular/common';
import { FaqsComponent } from '../../components/faqs/faqs.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    MeetMentorsComponent,
    FaqsComponent
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  coachesCount: number = 0;
  scholarshipsCount: number = 0;

  private targetCoaches = 25000;
  private targetScholarships = 5000;

  ngOnInit(): void {
    this.animateCounter('coaches');
    this.animateCounter('scholarships');
  }

  private animateCounter(type: 'coaches' | 'scholarships'): void {
    let current = 0;
    const target = type === 'coaches' ? this.targetCoaches : this.targetScholarships;
    const increment = Math.ceil(target / 200); // speed factor

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      if (type === 'coaches') {
        this.coachesCount = current;
      } else {
        this.scholarshipsCount = current;
      }
    }, 50); // 20ms update
  }

}
