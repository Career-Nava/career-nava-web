import { Component, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faArrowRightFromBracket, faChartLine, faFile, faHouse, faUser } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AuthService } from "../../../services/auth/auth.service";
import { SidebarService } from '../../../services/sidebar/sidebar.service';
import { SharedModule } from "../../../shared/shared.module";

@Component({
  selector: 'app-mentor-sidebar',
  standalone: true,
  imports: [ SharedModule, FontAwesomeModule ],
  templateUrl: './mentor-sidebar.component.html',
  styleUrl: './mentor-sidebar.component.scss'
})
export class MentorSidebarComponent implements OnInit, OnDestroy {
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  logout() {
    this.authService.logout();
  }

  onToggleSidebar() {
    this.sidebarService.toggle();
  }
}
