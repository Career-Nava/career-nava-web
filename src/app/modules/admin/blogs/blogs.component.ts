import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-admin-blogs',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss'
})
export class AdminBlogsComponent {
}
