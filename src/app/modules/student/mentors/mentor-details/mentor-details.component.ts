import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Mentor } from '../../../../services/mentors/IMentor';
import { MentorsService } from '../../../../services/mentors/mentors.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mentor-details',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './mentor-details.component.html',
  styleUrl: './mentor-details.component.scss'
})
export class MentorDetailsComponent {
  mentor?: Mentor;

  constructor(
    private mentorsService: MentorsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.mentorsService.getMentorById(id).subscribe({
      next: (data) => {
        this.mentor = data;
        console.log('Loaded mentor:', this.mentor);
      },
      error: (err) => {
        console.error('Error loading mentor by id:', err);
      }
    });
  }
}
