import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-regulations',
  templateUrl: './regulation.component.html',
  styleUrls: ['./regulation.component.scss'],
})
export class RegulationComponent implements OnInit {
  isEditMode = false;
  fullRegulationsText = '';

  constructor(private location: Location) {}

  ngOnInit(): void {
    this.loadRegulationsFromStorage();
  }

  goBack(): void {
    this.location.back();
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      // Save edited version to localStorage
      localStorage.setItem('fullRegulationsText', this.fullRegulationsText);
    }
    this.isEditMode = !this.isEditMode;
  }

  downloadAsTxt(): void {
    const blob = new Blob([this.fullRegulationsText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event-regulations.txt'; // Filename
    a.click();
  
    window.URL.revokeObjectURL(url); // Cleanup
  }
  

  private loadRegulationsFromStorage(): void {
    const storedText = localStorage.getItem('fullRegulationsText');

    if (storedText) {
      this.fullRegulationsText = storedText;
    } else {
      // Hardcoded default regulations
      this.fullRegulationsText = `
1. General Provisions
These Regulations define the rules for using the event platform, including user roles, account creation, and data processing.

2. User Responsibilities
- Users must provide accurate personal information during registration.
- It is forbidden to upload unlawful or offensive content.
- Users must respect event cancellation policies set by organizers.

3. Data Privacy
User data is stored securely and processed only for the purposes of event participation and platform functionality. Detailed information is available in the Privacy Policy.

4. Final Provisions
The platform administrators reserve the right to update these Regulations. Users will be notified of any significant changes via email.
`;
    }
  }
}
