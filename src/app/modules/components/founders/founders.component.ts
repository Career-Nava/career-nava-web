import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-founders',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './founders.component.html',
  styleUrl: './founders.component.scss'
})
export class FoundersComponent implements AfterViewInit {
  @ViewChild('foundersCarousel', { static: true }) carouselElement!: ElementRef;

  activeIndex = 0;

  founders = [
    {
      name: 'Lameck Owesi',
      image: 'assets/images/avatars/founders/lameck.png',
      message: 'At CareerNava, we believe that every scholar deserves access to the resources and support they need to achieve their educational goals. Our mission is to empower students from all backgrounds to unlock their full scholarship potential and pursue their dreams without financial barriers.'
    },
    {
      name: 'Oduor Kevin',
      image: 'assets/images/avatars/founders/kevin.png',
      message: 'Scholarships changed our lives. At CareerNava, we’re committed to helping you unlock the same opportunities and achieve your full potential.'
    }
  ];

  ngAfterViewInit() {
    const carousel = (this.carouselElement.nativeElement as any);

    carousel.addEventListener('slid.bs.carousel', (event: any) => {
      this.activeIndex = event.to;
    });
  }
}
