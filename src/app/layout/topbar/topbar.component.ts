import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { CalendlyService } from "../../services/calendly/calendly.service";
import { SidebarService } from '../../services/sidebar/sidebar.service';
import { UserModel } from '../../services/user/user.model';
import { SharedModule } from '../../shared/shared/shared.module';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './topbar.component.html',
  styleUrls: [ './topbar.component.scss' ]
})
export class TopbarComponent implements OnInit, OnDestroy {

  user: UserModel | null = null;
  calendlyVerified: boolean = false;
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private calendlyService: CalendlyService,
    private sidebarService: SidebarService
  ) {
  }

  ngOnInit(): void {
    // subscribe to reactive user
    this.subscriptions.add(
      this.authService.userObservable.subscribe(user => {
        this.user = user;
        this.calendlyVerified = user?.calendlyConnected ?? false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  connectCalendly(userId: number): void {
    // Navigate to the backend connect endpoint
    window.location.href = this.calendlyService.getConnectUrl(userId);
  }
}
