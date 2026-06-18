import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-admin-mentors',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './mentors.component.html',
  styleUrl: './mentors.component.scss'
})
export class AdminMentorsComponent {
}
