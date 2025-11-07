import { Component, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRightFromBracket, faCertificate, faLaptop, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { SidebarService } from '../../services/sidebar/sidebar.service';
import { SharedModule } from '../../shared/shared/shared.module';

interface SidebarItem {
  label: string;
  icon: any;
  route?: string;
  action?: () => void;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ SharedModule, FontAwesomeModule ],
  templateUrl: './sidebar.component.html',
  styleUrls: [ './sidebar.component.scss' ]
})
export class SidebarComponent implements OnInit, OnDestroy {
  isOpen = false;
  private subscription!: Subscription;

  // Define all menu items declaratively
  menuItems: SidebarItem[] = [
    { label: 'Explore Mentors', icon: faUsers, route: '/mentee/mentors' },
    { label: 'Scholarships', icon: faCertificate, route: '/mentee/scholarships' },
    { label: 'My Sessions', icon: faLaptop, route: '/mentee/sessions' },
    { label: 'Logout', icon: faArrowRightFromBracket, action: () => this.logout() }
  ];

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {
  }

  ngOnInit(): void {
    this.subscription = this.sidebarService.isOpen$.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
