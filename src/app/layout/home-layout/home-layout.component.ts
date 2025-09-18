import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SharedModule } from '../../shared/shared/shared.module';
import { HeaderComponent } from '../../modules/components/header/header.component';
import { FooterComponent } from '../../modules/components/footer/footer.component';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [
    SharedModule, 
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './home-layout.component.html',
  styleUrl: './home-layout.component.scss'
})
export class HomeLayoutComponent {
  displayModal = false;

  constructor(private router: Router){}

  joinTheWaitlistModal() {
    this.displayModal = !this.displayModal;
  }
}
