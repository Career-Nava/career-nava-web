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
      name: 'Pascal Aloo',
      message: "CareerNava was instrumental in my journey to securing a spot in the Jasiri Entrepreneurial Program. Their guidance was exceptional.",
      image: 'assets/images/avatars/testimonials/Pascal-Aloo.png'
    },
    {
      name: 'Dennis Njogu',
      message: "Thanks to CareerNava, I successfully navigated the Jasiri Talent Investor Program application process. Their expert advice and encouragement gave me the confidence I needed to stand out and secure my place. I highly recommend their services.",
      image: 'assets/images/avatars/testimonials/njogu.png'
    },
    {
      name: 'Germain Akeza Shine',
      message: 'CareerNava played a pivotal role in my master’s scholarship application. Their support and thorough preparation helped me secure the Graduate Research Assistantship at Kentucky State University. I’m forever grateful for their unwavering guidance.',
      image: 'assets/images/avatars/testimonials/pattern-purple.png'
    },
    {
      name: 'Joan Mawia',
      message: "CareerNava's support was crucial in helping me through the interview process for my master's program at the University of Oslo. Their tailored coaching and insights were exactly what I needed to succeed.",
      image: 'assets/images/avatars/testimonials/joan.png'
    },
    {
      name: 'Emanuel Akaka',
      message: 'CareerNava’s expertise and personalized approach were key in my successful application for the Mandela Rhodes Scholarship. Their dedication to my success was evident every step of the way. I’m incredibly grateful for their support.',
      image: 'assets/images/avatars/testimonials/Emmanuel-Akaka.png'
    }
  ];
}
