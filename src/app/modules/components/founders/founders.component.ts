import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared/shared.module';

@Component({
  selector: 'app-founders',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './founders.component.html',
  styleUrl: './founders.component.scss'
})
export class FoundersComponent {
 activeIndex = 0;

  founders = [
    {
      name: 'Lameck Owesi',
      image: 'assets/images/avatars/founders/lameck.png',
      message: 'At CareerNava, we believe that every scholar deserves access to the resources and support they need to achieve their educational goals. Our Mission is to empower students from all backgrounds to unlock their full scholarship potential and pursue their dreams without financial barriers'
    },
    {
      name: 'Odour Kevin',
      image: 'assets/images/avatars/founders/kevin.png',
      message: 'Scholarships changed our lives. At CareerNava, we’re committed to helping you unlock the same opportunities and achieve your full potential.'
    }
  ];

  ngAfterViewInit() {
    // Listen for slide change to trigger the zoom-in animation
    const carousel: any = document.querySelector('#foundersCarousel');
    carousel.addEventListener('slid.bs.carousel', (event: any) => {
      this.activeIndex = event.to;
    });
  }

}
