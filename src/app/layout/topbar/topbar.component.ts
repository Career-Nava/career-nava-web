import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../services/auth/auth.service";
import { UserModel } from "../../services/user/user.model";
import { SidebarService } from '../../services/sidebar/sidebar.service';
import { SharedModule } from '../../shared/shared/shared.module';
import { faCalendarCheck, faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {
  faCheckBadge = faCalendarCheck;
  faCheck = faCheck;

  user: UserModel | null = null;
  calendlyVerified: Boolean = true;

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    // console.log("User data:", this.user);
  }

  logout() {
    this.authService.logout();
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }
}
