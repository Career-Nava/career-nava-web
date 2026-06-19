import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, merge, startWith } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { SharedModule } from '../shared/shared.module';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AuthRole, AUTH_SIDEBAR_CONFIG, SidebarRoleConfig } from './sidebar/sidebar.config';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: [ './layout.component.scss' ],
  standalone: true,
  imports: [ SharedModule, TopbarComponent, SidebarComponent ],
})
export class LayoutComponent {
  private readonly destroyRef = inject(DestroyRef);

  role: AuthRole = 'mentee';
  sidebarConfig: SidebarRoleConfig = AUTH_SIDEBAR_CONFIG.mentee;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    merge(
      this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)),
      this.authService.user$
    )
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncRoleState());
  }

  private syncRoleState(): void {
    const role = this.resolveRole();
    this.role = role;
    this.sidebarConfig = AUTH_SIDEBAR_CONFIG[ role ];
  }

  private resolveRole(): AuthRole {
    const snapshotRole = this.findRoleInSnapshot(this.router.routerState.snapshot.root);
    if (snapshotRole) {
      return snapshotRole;
    }

    const urlRole = this.findRoleFromUrl(this.router.url);
    if (urlRole) {
      return urlRole;
    }

    const userRole = this.coerceRole(this.authService.getUser()?.role);
    if (userRole) {
      return userRole;
    }

    return 'mentee';
  }

  private findRoleInSnapshot(snapshot: ActivatedRouteSnapshot | null): AuthRole | null {
    let current = snapshot;

    while (current) {
      const layoutRole = this.coerceRole(current.data?.[ 'layoutRole' ]);
      if (layoutRole) {
        return layoutRole;
      }

      const guardRole = this.coerceRole((current.data?.[ 'roles' ] as string[] | undefined)?.[ 0 ]);
      if (guardRole) {
        return guardRole;
      }

      current = current.firstChild ?? null;
    }

    return null;
  }

  private findRoleFromUrl(url: string): AuthRole | null {
    const normalizedUrl = url.split('?')[ 0 ].split('#')[ 0 ];

    if (normalizedUrl === '/admin' || normalizedUrl.startsWith('/admin/')) {
      return 'admin';
    }

    if (normalizedUrl === '/mentor' || normalizedUrl.startsWith('/mentor/')) {
      return 'mentor';
    }

    if (normalizedUrl === '/mentee' || normalizedUrl.startsWith('/mentee/')) {
      return 'mentee';
    }

    return null;
  }

  private coerceRole(role: unknown): AuthRole | null {
    if (role === 'admin' || role === 'mentor' || role === 'mentee') {
      return role;
    }

    return null;
  }
}
