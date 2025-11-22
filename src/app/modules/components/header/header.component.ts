import { Component, HostListener } from '@angular/core';
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
  isScrolled = false;

  constructor(private authService: AuthService) {
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollThreshold: number = 100;

    if (window.scrollY > scrollThreshold && !this.isScrolled) {
      this.isScrolled = true;
    } else if (window.scrollY <= scrollThreshold && this.isScrolled) {
      this.isScrolled = false;
    }
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
