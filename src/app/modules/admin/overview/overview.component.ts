import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { UserModel } from '../../../services/user/user.model';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent {
  user: UserModel | null = null;

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
  }
}
