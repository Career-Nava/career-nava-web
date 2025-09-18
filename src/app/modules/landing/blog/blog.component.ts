import { Component } from '@angular/core';
import { MeetMentorsComponent } from '../../components/meet-mentors/meet-mentors.component';
import { FaqsComponent } from '../../components/faqs/faqs.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    FaqsComponent,
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent {

}
