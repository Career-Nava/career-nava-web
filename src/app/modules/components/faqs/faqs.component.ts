import { NgForOf } from "@angular/common";
import { Component } from '@angular/core';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faqs',
  standalone: true,
  templateUrl: './faqs.component.html',
  imports: [ NgForOf ],
  styleUrls: [ './faqs.component.scss' ]
})
export class FaqsComponent {
  faqs: FaqItem[] = [
    {
      question: 'How does the coaching program work?',
      answer: `Sign up, browse verified coaches, pick the one who matches your goals, and schedule a session.
               It’s designed to make scholarship guidance simple and effective.`
    },
    {
      question: 'Can I browse coaches and scholarships for free?',
      answer: `Yes. Once you sign up and log in, you can explore all coaches, view their availability,
               and see highlighted scholarships and fellowships at no cost.`
    },
    {
      question: 'Who are the coaches?',
      answer: `Coaches are vetted and verified scholarship recipients holding top scholarships globally-ensuring high-quality guidance`
    },
    {
      question: 'What scholarships and fellowships are highlighted?',
      answer: `We curate and verify scholarships and fellowships to help you find opportunities that match your goals and skill level.`
    },
    {
      question: 'How are the guidance sessions conducted?',
      answer: `Sessions take place virtually via video-conferencing platforms such as Google Meet. Coaches provide a meeting link once your session is scheduled.`
    },
    {
      question: 'Is there a cost to schedule a call?',
      answer: `Yes. Scheduling a coaching  session comes with a platform fee, set per session. Coach rates may vary.`
    },
    {
      question: 'Who can use this platform?',
      answer: `Prospective scholarship applicants including university students, early- or mid-career professionals.`
    },
    {
      question: 'How do I choose the right coach?',
      answer: `Browse coach profiles, check their experience, availability, and reviews, then select the one whose expertise aligns with your goals.`
    },
    {
      question: 'Is my data safe?',
      answer: `Yes. All user information and communication are securely handled, and coaches are verified for trust and reliability.`
    },
    {
      question: 'What happens after my session?',
      answer: `You can schedule follow-ups, continue messaging your coach if needed, and explore new opportunities or sessions as your goals evolve.`
    }
  ];
}
