import { Component, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faArrowRightFromBracket, faChartLine, faFile, faHouse, faUser } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AuthService } from "../../../services/auth/auth.service";
import { SidebarService } from '../../../services/sidebar/sidebar.service';
import { SharedModule } from "../../../shared/shared/shared.module";

@Component({
  selector: 'app-teacher-sidebar',
  standalone: true,
  imports: [ SharedModule, FontAwesomeModule ],
  templateUrl: './teacher-sidebar.component.html',
  styleUrl: './teacher-sidebar.component.scss'
})
export class TeacherSidebarComponent implements OnInit, OnDestroy {
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
