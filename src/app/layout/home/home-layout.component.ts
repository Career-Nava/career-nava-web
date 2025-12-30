import { Component } from '@angular/core';
import { FooterComponent } from '../../modules/components/footer/footer.component';
import { HeaderComponent } from '../../modules/components/header/header.component';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ SharedModule, HeaderComponent, FooterComponent ],
  templateUrl: './home-layout.component.html',
  styleUrl: './home-layout.component.scss'
})
export class HomeLayoutComponent {

}
