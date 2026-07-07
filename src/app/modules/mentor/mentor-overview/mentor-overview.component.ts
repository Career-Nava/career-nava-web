import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { UserModel } from '../../../services/user/user.model';
import { SharedModule } from '../../../shared/shared.module';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mentor-overview',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './mentor-overview.component.html',
  styleUrls: [ './mentor-overview.component.scss' ]
})
export class MentorOverviewComponent implements OnInit, OnDestroy {
  user: UserModel | null = null;
  private readonly subscriptions = new Subscription();

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.user$.subscribe(user => this.user = user)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
