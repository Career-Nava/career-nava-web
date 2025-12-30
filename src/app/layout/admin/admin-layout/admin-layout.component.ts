import { Component } from '@angular/core';
import { SharedModule } from "../../../shared/shared.module";
import { MentorSidebarComponent } from "../../mentor/mentor-sidebar/mentor-sidebar.component";
import { TopbarComponent } from "../../topbar/topbar.component";
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [ SharedModule, TopbarComponent, AdminSidebarComponent, MentorSidebarComponent ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {

}
