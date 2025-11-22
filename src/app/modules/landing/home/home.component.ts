import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { PingService } from "../../../services/ping.service";
import { FaqsComponent } from '../../components/faqs/faqs.component';
import { FoundersComponent } from '../../components/founders/founders.component';
import { MeetMentorsComponent } from '../../components/meet-mentors/meet-mentors.component';
import { PricingComponent } from '../../components/pricing/pricing.component';
import { TestimonialComponent } from '../../components/testimonial/testimonial.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ MeetMentorsComponent, PricingComponent, TestimonialComponent, FaqsComponent, RouterLink, FoundersComponent ],
  templateUrl: './home.component.html',
  styleUrls: [ './home.component.scss' ],
})
export class HomeComponent implements OnInit {

  constructor(private pingService: PingService) {
  }

  ngOnInit(): void {
    this.pingService.pingServer();
  }

  clientLogos = [
    'assets/images/clients/Microsoft.svg',
    'assets/images/clients/google.svg',
    'assets/images/clients/mastercard-foundation-sc.webp',
    'assets/images/clients/mext-scholarship-sc.webp',
    'assets/images/clients/chevening-sc.webp',
    'assets/images/clients/mwf-stacked-rgb.webp',
    'assets/images/clients/Yoast-social-logo.webp',
  ];

  values = [
    {
      number: '01',
      title: 'Compatibility',
      icon: 'assets/icons/Virtual-Meeting.png',
      description: 'Enhance your practice with personalized case management, ensuring you and your clients are always in sync.',
    },
    {
      number: '02',
      title: 'Convinience',
      icon: 'assets/icons/Facetime.png',
      description: 'Elevate your team’s performance by consolidating case management across departments, improving collaboration and efficiency.',
    },
    {
      number: '03',
      title: 'Qualified Mentors',
      icon: 'assets/icons/Insurance.png',
      description: 'Access top-tier guidance from experienced mentors dedicated to your growth and success.',
    }
  ];

  services = [
    {
      number: '01',
      title: 'Scholarship Application Guidance',
      icon: 'assets/icons/Quality-Check.png',
      description: 'We take the guesswork out of the scholarship application process. Our expert guidance helps you navigate each step with confidence, from identifying the most suitable scholarships to crafting a strong, compelling application. We provide personalized coaching to ensure that your application stands out, increasing your chances of success.',
    },
    {
      number: '02',
      title: 'Scholarship Essays Review',
      icon: 'assets/icons/Performance-Evaluation.png',
      description: 'Your scholarship essay is your opportunity to shine—and we’re here to help you make it unforgettable. Our essay review service offers detailed feedback and expert recommendations to refine your writing, ensuring your story is powerful, clear, and aligned with what scholarship committees are looking for. We help you present your best self on paper.',
    },
    {
      number: '03',
      title: 'Updates on Available Scholarships',
      icon: 'assets/icons/Sync.png',
      description: 'Never miss an opportunity with CareerNava’s up-to-date scholarship alerts. We keep you informed about the latest scholarships tailored to your academic and career goals. Our service ensures that you’re always in the know, giving you a competitive edge by allowing you to apply as soon as opportunities arise.',
    },
    {
      number: '04',
      title: 'Scholarship Readiness Assessment',
      icon: 'assets/icons/Approval.png',
      description: 'Are you ready to apply for scholarships? Our Scholarship Readiness Assessment evaluates your preparedness, identifying strengths and areas for improvement. We provide actionable insights and personalized recommendations, so you can approach the application process with confidence, knowing you’re fully prepared to succeed.',
    }
  ];
}
