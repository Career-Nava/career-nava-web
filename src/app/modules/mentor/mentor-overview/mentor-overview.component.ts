import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastService } from '../../../services/toast.service';
import { UserModel } from '../../../services/user/user.model';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-mentor-overview',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './mentor-overview.component.html',
  styleUrls: [ './mentor-overview.component.scss' ]
})
export class MentorOverviewComponent implements OnInit, OnDestroy {
  user: UserModel | null = null;
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.user$.subscribe(user => this.user = user)
    );

    this.handleCalendlyRedirect();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private handleCalendlyRedirect(): void {
    const queryParams = this.route.snapshot.queryParamMap;
    const status = queryParams.get('status');
    const message = queryParams.get('message');

    if (!status) return;

    if (status === 'success') {
      this.toastService.show('Calendly linked successfully!', { classname: 'bg-success text-light', delay: 5000 });
      this.authService.updateUser({ calendlyConnected: true });
    } else if (status === 'error') {
      this.toastService.show(`Error linking Calendly: ${ message }`, { classname: 'bg-danger text-light', delay: 7000 });
    }

    void this.router.navigate([ '/mentor/overview' ], { queryParams: {} });
  }
}
