import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faArrowRight, faCalendar, faClock, faEllipsisV, faEnvelope, faFile } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from "rxjs";
import { AuthService } from "../../../services/auth/auth.service";
import { ToastService } from "../../../services/toast.service";
import { UserModel } from "../../../services/user/user.model";
import { SharedModule } from "../../../shared/shared.module";

@Component({
  selector: 'app-teacher-overview',
  standalone: true,
  imports: [ FaIconComponent, SharedModule ],
  templateUrl: './teacher-overview.component.html',
  styleUrls: [ './teacher-overview.component.scss' ]
})
export class TeacherOverviewComponent implements OnInit, OnDestroy {

  faCalendar = faCalendar;
  faClock = faClock;
  faEnvelope = faEnvelope;
  faDotVertical = faEllipsisV;
  faFile = faFile;
  faArrowRight = faArrowRight;

  private subscriptions = new Subscription();
  user: UserModel | null = null;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    // reactive user
    this.subscriptions.add(
      this.authService.userObservable.subscribe(user => this.user = user)
    );

    this.checkCalendlyRedirect();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private checkCalendlyRedirect(): void {
    const status = this.route.snapshot.queryParamMap.get('status');
    const message = this.route.snapshot.queryParamMap.get('message');

    if (status === 'success') {
      this.toastService.show('Calendly linked successfully!', { classname: 'bg-success text-light', delay: 5000 });

      // Update user to mark Calendly connected
      this.authService.updateUser({ calendlyConnected: true });

      // navigate to overview without query params
      void this.router.navigate([ '/teacher/overview' ], { queryParams: {} });
    }

    if (status === 'error') {
      this.toastService.show(`Error linking Calendly: ${ message }`, { classname: 'bg-danger text-light', delay: 7000 });
      void this.router.navigate([ '/teacher/overview' ], { queryParams: {} });
    }
  }
}
