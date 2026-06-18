import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-mentor-profile',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './mentor-profile.component.html',
  styleUrl: './mentor-profile.component.scss'
})
export class MentorProfileComponent {
}
