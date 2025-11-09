import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ RouterLink, RouterLinkActive ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(private authService: AuthService) {
  }

  // Wrap AuthService method for template use
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
