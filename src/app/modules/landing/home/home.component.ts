import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { PingService } from "../../../services/ping.service";
import { FaqsComponent } from '../../components/faqs/faqs.component';
import { MeetMentorsComponent } from '../../components/meet-mentors/meet-mentors.component';
import { PricingComponent } from '../../components/pricing/pricing.component';
import { TestimonialComponent } from '../../components/testimonial/testimonial.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ MeetMentorsComponent, PricingComponent, TestimonialComponent, FaqsComponent, RouterLink ],
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
      description:
        'Enhance your practice with personalized case management, ensuring you and your clients are always in sync.',
    },
    {
      number: '02',
      title: 'Convinience',
      description:
        'Elevate your team’s performance by consolidating case management across departments, improving collaboration and efficiency.',
    },
    {
      number: '03',
      title: 'Qualified Mentors',
      description:
        'Access top-tier guidance from experienced mentors dedicated to your growth and success.',
    }
  ];

  services = [
    {
      number: '01',
      title: 'Scholarship Application Guidance',
      description:
        'We take the guesswork out of scholarship applications. From identifying the best scholarships to crafting standout applications, our coaching ensures your success.',
    },
    {
      number: '02',
      title: 'Scholarship Essays Review',
      description:
        'Our essay review service refines your writing, ensuring your story is compelling and aligns with scholarship expectations.',
    },
    {
      number: '03',
      title: 'Updates on Available Scholarships',
      description:
        'Stay informed with timely scholarship alerts tailored to your goals, so you never miss an opportunity.',
    },
    {
      number: '04',
      title: 'Scholarship Readiness Assessment',
      description:
        'Our readiness assessment evaluates your preparedness and provides actionable insights for success.',
    }
  ];
}
