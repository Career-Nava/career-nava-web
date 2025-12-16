import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { CalendlyService } from "../../services/calendly/calendly.service";
import { SidebarService } from '../../services/sidebar/sidebar.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './topbar.component.html',
  styleUrls: [ './topbar.component.scss' ]
})
export class TopbarComponent {

  // Expose reactive user directly
  readonly user$ = this.authService.user$;

  constructor(
    private authService: AuthService,
    private calendlyService: CalendlyService,
    private sidebarService: SidebarService
  ) {
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  connectCalendly(userId: number): void {
    window.location.href = this.calendlyService.getConnectUrl(userId);
  }
}
