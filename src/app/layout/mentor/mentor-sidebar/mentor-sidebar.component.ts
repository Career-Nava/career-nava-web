import { Component, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRightFromBracket, faFile, faHouse, faUser } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { SidebarService } from '../../../services/sidebar/sidebar.service';
import { SharedModule } from '../../../shared/shared.module';

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
  faArrowRightFromBracket = faArrowRightFromBracket;

  isOpen = false;
  private subscription?: Subscription;

  constructor(private authService: AuthService, private sidebarService: SidebarService) {
  }

  ngOnInit(): void {
    this.subscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
  }

  onToggleSidebar(): void {
    this.sidebarService.toggle();
  }
}
