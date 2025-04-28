import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit {
  searchTerm: string = '';

  faqs = [
    { question: 'How do I create an account?', answer: 'Click on Sign Up and fill the form.', likes: 0 },
    { question: 'How to reset my password?', answer: 'Click "Forgot password" on the login page.', likes: 0 },
    { question: 'Where can I view my tickets?', answer: 'Go to your profile and select Tickets.', likes: 0 },
    { question: 'Can I cancel an event?', answer: 'Yes, but check the cancellation policy for each event.', likes: 0 },
    { question: 'How do I contact support?', answer: 'Email us at support@example.com.', likes: 0 }
  ];

  constructor(private location: Location) {}

  ngOnInit(): void {
    this.loadLikes();
  }

  get filteredFaqs() {
    if (!this.searchTerm.trim()) return this.faqs;
    return this.faqs.filter(faq =>
      faq.question.toLowerCase().startsWith(this.searchTerm.toLowerCase())
    );
  }

  goBack() {
    this.location.back();
  }

  isProposing = false;
  proposedQuestion = '';

  toggleProposeMode() {
    this.isProposing = !this.isProposing;
  }

  submitProposedQuestion() {
    if (this.proposedQuestion.trim()) {
      console.log('Proposed question:', this.proposedQuestion);
      alert('Thank you! Your question has been sent to the administrators.');
      this.proposedQuestion = '';
      this.isProposing = false;
    } else {
      alert('Please enter a question before sending.');
    }
  }

  likeFaq(faq: any) {
    faq.likes += 1;
    this.saveLikes();
  }

  private saveLikes() {
    const likesMap = this.faqs.reduce((acc, faq) => {
      acc[faq.question] = faq.likes;
      return acc;
    }, {} as Record<string, number>);
    localStorage.setItem('faqLikes', JSON.stringify(likesMap));
  }

  private loadLikes() {
    const storedLikes = localStorage.getItem('faqLikes');
    if (storedLikes) {
      const likesMap = JSON.parse(storedLikes);
      this.faqs.forEach(faq => {
        if (likesMap[faq.question] !== undefined) {
          faq.likes = likesMap[faq.question];
        }
      });
    }
  }
}
