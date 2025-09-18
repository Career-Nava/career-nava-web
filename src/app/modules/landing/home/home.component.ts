import { AfterViewInit, Component } from '@angular/core';
import { MeetMentorsComponent } from '../../components/meet-mentors/meet-mentors.component';
import { PricingComponent } from '../../components/pricing/pricing.component';
import { TestimonialComponent } from '../../components/testimonial/testimonial.component';
import { FaqsComponent } from '../../components/faqs/faqs.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MeetMentorsComponent,
    PricingComponent,
    TestimonialComponent,
    FaqsComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit {
  displayModal = false;
  yearlyBilling: boolean = true;
  bootstrap: any;

  joinTheWaitlistModal() {
      this.displayModal = !this.displayModal;
  }

  ngAfterViewInit() {
    // var myCarousel = document.querySelector('#carouselExampleCaptions');
    // var carousel = new this.bootstrap.Carousel(myCarousel, {
    //   interval: 2000,
    //   wrap: true
    // });
  }
}
