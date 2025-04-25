import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent {
  searchTerm: string = '';
  
  faqs = [
    { question: 'How do I create an account?', answer: 'Click on Sign Up and fill the form.' },
    { question: 'How to reset my password?', answer: 'Click "Forgot password" on the login page.' },
    { question: 'Where can I view my tickets?', answer: 'Go to your profile and select Tickets.' },
    { question: 'Can I cancel an event?', answer: 'Yes, but check the cancellation policy for each event.' },
    { question: 'How do I contact support?', answer: 'Email us at support@example.com.' }
  ];

  get filteredFaqs() {
    if (!this.searchTerm.trim()) return this.faqs;
    return this.faqs.filter(faq =>
      faq.question.toLowerCase().startsWith(this.searchTerm.toLowerCase())
    );
  }

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
