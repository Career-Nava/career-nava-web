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
      question: 'How does the mentorship program work?',
      answer: `Sign up, browse verified mentors, pick the one who matches your goals, and schedule a session.
               It’s designed to make professional guidance simple and effective.`
    },
    {
      question: 'Can I browse mentors and scholarships for free?',
      answer: `Yes. Once you sign up and log in, you can explore all mentors, view their availability,
               and see highlighted scholarships and internships at no cost.`
    },
    {
      question: 'Who are the mentors?',
      answer: `Mentors are recruited, vetted, and verified professionals in their fields — from tech experts to career counsellors — ensuring high-quality guidance.`
    },
    {
      question: 'What scholarships and internships are highlighted?',
      answer: `We curate and verify scholarships and internships to help you find opportunities that match your goals and skill level.`
    },
    {
      question: 'How are mentorship sessions conducted?',
      answer: `Sessions take place via external platforms such as Google Meet or Microsoft Teams.
               Mentors provide a meeting link once a session is scheduled.`
    },
    {
      question: 'Is there a cost to schedule a call?',
      answer: `Yes. Scheduling a mentorship session comes with a platform fee, set per session. Mentor rates may vary.`
    },
    {
      question: 'Who can use this platform?',
      answer: `University students, early-career professionals, and mid-career switchers looking for guidance, mentorship, or career advice.`
    },
    {
      question: 'How do I choose the right mentor?',
      answer: `Browse mentor profiles, check their experience, availability, and reviews, then select the one whose expertise aligns with your goals.`
    },
    {
      question: 'Is my data safe?',
      answer: `Yes. All user information and communication are securely handled, and mentors are verified for trust and reliability.`
    },
    {
      question: 'What happens after my session?',
      answer: `You can schedule follow-ups, continue messaging your mentor if needed, and explore new opportunities or sessions as your goals evolve.`
    }
  ];
}
