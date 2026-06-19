import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRightFromBracket, faXmark } from '@fortawesome/free-solid-svg-icons';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { SidebarService } from '../../services/sidebar/sidebar.service';
import { SharedModule } from '../../shared/shared.module';
import { SidebarNavItem, SidebarRoleConfig } from './sidebar.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ SharedModule, FontAwesomeModule ],
  templateUrl: './sidebar.component.html',
  styleUrls: [ './sidebar.component.scss' ]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) config!: SidebarRoleConfig;

  readonly faArrowRightFromBracket = faArrowRightFromBracket;
  readonly faXmark = faXmark;

  isOpen = false;
  private readonly subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService
  ) {
  }

  ngOnInit(): void {
    this.subscription.add(
      this.sidebarService.isOpen$.subscribe(isOpen => {
        this.isOpen = isOpen;
      })
    );

    this.subscription.add(
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(() => this.sidebarService.close())
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  isItemActive(item: SidebarNavItem): boolean {
    const currentUrl = this.normalizedUrl(this.router.url);
    const activePrefixes = item.activePrefixes?.length ? item.activePrefixes : [ item.route ];

    if (item.exact) {
      return currentUrl === this.normalizedUrl(item.route);
    }

    return activePrefixes.some(prefix => {
      const normalizedPrefix = this.normalizedUrl(prefix);
      return currentUrl === normalizedPrefix || currentUrl.startsWith(`${ normalizedPrefix }/`);
    });
  }

  closeSidebar(): void {
    this.sidebarService.close();
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  logout(): void {
    this.sidebarService.close();
    this.authService.logout();
  }

  private normalizedUrl(url: string): string {
    return url.split('?')[ 0 ].split('#')[ 0 ].replace(/\/+$/, '') || '/';
  }
}
