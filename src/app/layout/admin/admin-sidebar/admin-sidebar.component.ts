import { Component } from '@angular/core';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faArrowRightFromBracket, faChartLine, faFile, faHouse, faUser } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AuthService } from "../../../services/auth/auth.service";
import { SidebarService } from '../../../services/sidebar/sidebar.service';
import { SharedModule } from "../../../shared/shared/shared.module";

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [ SharedModule, FontAwesomeModule ],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent {
  faHouse = faHouse;
  faFile = faFile;
  faUser = faUser;
  faChartLine = faChartLine;
  faArrowRightFromBracket = faArrowRightFromBracket;

  isOpen = false;
  private subscription!: Subscription;

  constructor(private authService: AuthService, private sidebarService: SidebarService) {
  }

  ngOnInit(): void {
    this.subscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      this.isOpen = isOpen;
      // Apply CSS class changes or direct styles as needed
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }
}
