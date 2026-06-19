import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CalendlyService } from "../../services/calendly/calendly.service";
import { SidebarService } from '../../services/sidebar/sidebar.service';
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
    private calendlyService: CalendlyService,
    private sidebarService: SidebarService,
    private router: Router
  ) {
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  connectCalendly(userId: number): void {
    window.location.href = this.calendlyService.getConnectUrl(userId);
  }

  hasProfileRoute(role: string | undefined): boolean {
    return this.getProfileRoute(role) !== null;
  }

  // TODO: Wire to profile management once profile routes are available for all roles.
  openProfile(role: string | undefined): void {
    const profileRoute = this.getProfileRoute(role);
    if (!profileRoute) {
      return;
    }

    this.router.navigateByUrl(profileRoute);
  }

  logout() {
    this.sidebarService.close();
    this.authService.logout();
  }

  private getProfileRoute(role: string | undefined): string | null {
    if (role === 'mentor') {
      return '/mentor/profile';
    }

    return null;
  }
}
