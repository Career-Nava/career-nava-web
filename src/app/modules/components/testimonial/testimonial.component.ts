import { NgForOf, NgIf } from "@angular/common";
import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonial',
  standalone: true,
  imports: [ NgIf, NgForOf ],
  templateUrl: './testimonial.component.html',
  styleUrl: './testimonial.component.scss'
})
export class TestimonialComponent {

  testimonials = [
    {
      name: 'Joan Mawia',
      message: "CareerNava's support was crucial in helping me through the interview process for my master's program at the University of Oslo. Their tailored coaching and insights were exactly what I needed to succeed.",
      image: 'assets/images/avatars/joan.png'
    },
    {
      name: 'Lameck Owesi',
      message: "Thanks to CareerNava, I successfully navigated the Jasiri Talent Investor Program application process. Their expert advice and encouragement gave me the confidence I needed to stand out and secure my place. I highly recommend their services.",
      image: 'assets/images/avatars/lameck.png'
    },
    {
      name: 'Dennis Njogu',
      message: "Thanks to CareerNava, I successfully navigated the Jasiri Talent Investor Program application process. Their expert advice and encouragement gave me the confidence I needed to stand out and secure my place. I highly recommend their services.",
      image: 'assets/images/avatars/njogu.png'
    },
    {
      name: 'Pascal Aloo',
      message: "CareerNava was instrumental in my journey to securing a spot in the Jasiri Entrepreneurial Program. Their guidance was exceptional.",
      image: 'assets/images/avatars/kevin.jpeg'
    }
  ];
}
