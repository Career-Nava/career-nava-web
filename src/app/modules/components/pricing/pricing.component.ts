import { Component } from '@angular/core';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent {

  pricingPackages = [
    {
      title: "Free",
      price: null,
      features: [
        "Unlimited Scholarship Opportunities",
        "Readiness Assessment",
        "Limited Application Resources"
      ],
      button: "Check Out Free Package",
      recommended: false
    },
    {
      title: "Basic",
      price: "$40",
      features: [
        "4 Guidance Sessions - 45min each",
        "Individual/Group Sessions",
        "Complete Within 3 Weeks",
        "* All Free Services"
      ],
      button: "Check Out Basic Package",
      recommended: false
    },
    {
      title: "End-to-End",
      price: "$100",
      recommended: true,
      features: [
        "Guidance Sessions - Unlimited",
        "Document Creation & Reviews",
        "Interview Preparation",
      ],
      button: "Check Out End-to-End Package"
    },
    {
      title: "Stand Alone",
      price: "$100",
      features: [
        "Document Reviews",
        "Document Creation & Reviews",
        "Interview Preparation",
      ],
      button: "Check Stand Alone Package",
      recommended: false
    }
  ];

}
