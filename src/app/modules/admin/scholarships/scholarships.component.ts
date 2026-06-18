import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-admin-scholarships',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './scholarships.component.html',
  styleUrl: './scholarships.component.scss'
})
export class AdminScholarshipsComponent {
}
