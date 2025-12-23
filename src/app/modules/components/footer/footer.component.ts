import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ RouterLink ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  logo = {
    src: 'assets/images/logo/logo.png',
    alt: 'Career Nava Logo',
    link: '/home',
  };

  mainHeading = 'Unlock Your Scholarship Potential!';
  mainText = '';

  companyLinks = [
    { label: 'Home', path: '/home' },
    { label: 'About Us', path: '/about' },
    { label: 'Services', path: '/services' },
  ];

  legalLinks = [
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Terms and Conditions', path: '/terms' },
  ];

  contact = {
    address: 'Karen Village, Nairobi (Kenya)',
    email: 'careernava.app@gmail.com',
    phone: '+254 715 429 997',
  };

  currentYear = new Date().getFullYear();
}
