import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [ SharedModule, RouterLink ],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss'
})
export class PageNotFoundComponent {
}
