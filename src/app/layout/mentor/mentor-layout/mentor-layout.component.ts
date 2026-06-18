import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { TopbarComponent } from '../../topbar/topbar.component';
import { MentorSidebarComponent } from '../mentor-sidebar/mentor-sidebar.component';

@Component({
  selector: 'app-mentor-layout',
  standalone: true,
  imports: [ SharedModule, TopbarComponent, MentorSidebarComponent ],
  templateUrl: './mentor-layout.component.html',
  styleUrl: './mentor-layout.component.scss'
})
export class MentorLayoutComponent {
}
