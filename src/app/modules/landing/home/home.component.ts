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
      description: 'We match you with coaches whose academic backgrounds and career goals align with your needs, ensuring practical, relevant, and results-driven scholarship and fellowship guidance.',
    },
    {
      number: '02',
      title: 'Convinience',
      icon: 'assets/icons/Facetime.png',
      description: 'Our platform offers flexible, on-demand access to expert guidance, enabling easy booking, virtual sessions from anywhere, and timely, schedule-friendly support.',
    },
    {
      number: '03',
      title: 'Qualified Coaches',
      icon: 'assets/icons/Insurance.png',
      description: 'All Career Nava coaches are carefully vetted scholarship and fellowship recipients, delivering high-impact, competitive application guidance.',
    }
  ];

  services = [
    {
      number: '01',
      title: 'Our Services',
      icon: 'assets/icons/Quality-Check.png',
      description: 'Book a Career Nava guidance session and get expert, personalized support to identify the right scholarship opportunities and craft a strong, competitive application that stands out.',
    },
    {
      number: '02',
      title: 'Scholarship Essays Review',
      icon: 'assets/icons/Performance-Evaluation.png',
      description: 'Make your scholarship essay impossible to ignore. Access our expert review service to receive detailed feedback, sharpen your story, and present a compelling, well-aligned application that stands out to selection committees.',
    },
    {
      number: '03',
      title: 'Updates on Available Scholarships',
      icon: 'assets/icons/Sync.png',
      description: 'Stay ahead of every opportunity with Career Nava’s real-time scholarship updates. Subscribe for tailored alerts and apply early with confidence, giving yourself a decisive competitive advantage in every application cycle.',
    },
    {
      number: '04',
      title: 'Scholarship Readiness Assessment',
      icon: 'assets/icons/Approval.png',
      description: 'Find out if you’re truly scholarship-ready. Take our readiness assessment to identify gaps, strengthen your profile, and receive personalized recommendations that prepare you to apply with clarity and confidence.',
    }
  ];
}
