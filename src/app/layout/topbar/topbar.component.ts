import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { SidebarService } from '../../services/sidebar/sidebar.service';
import { UserModel } from '../../services/user/user.model';
import { SharedModule } from '../../shared/shared.module';
import { faArrowRightFromBracket, faBars, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './topbar.component.html',
  styleUrls: [ './topbar.component.scss' ]
})
export class TopbarComponent {
  @Input() homeRoute = '/home';

  readonly user$ = this.authService.user$;
  readonly faArrowRightFromBracket = faArrowRightFromBracket;
  readonly faBars = faBars;
  readonly faUser = faUser;

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private router: Router
  ) {
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  getProfileRoute(role: string | undefined): string {
    return this.authService.getAccountProfileUrlForRole(role);
  }

  openProfile(role: string | undefined): void {
    this.router.navigateByUrl(this.getProfileRoute(role));
  }

  logout() {
    this.sidebarService.close();
    this.authService.logout();
  }
}
