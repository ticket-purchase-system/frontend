import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { LoyaltyProgram, LoyaltyProgramService } from '../../loyalty-program.service';

interface Benefit {
  description: string;
  available: boolean;
}

interface MembershipTier {
  name: string;
  color: string;
  benefits: Benefit[];
}

@Component({
  selector: 'app-loyalty-program',
  templateUrl: './loyalty-program.component.html',
  styleUrl: './loyalty-program.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule
  ]
})
export class LoyaltyProgramComponent implements OnInit {
  isLoading = true;
  isMember = false;
  membership: LoyaltyProgram | null = null;
  preferencesForm: FormGroup;
  joinForm: FormGroup;
  isSubmitting = false;
  
  tiers: { [key: string]: MembershipTier } = {
    bronze: {
      name: 'Bronze',
      color: '#CD7F32',
      benefits: [
        { description: 'Early access to selected events', available: true },
        { description: 'Birthday gift', available: true },
        { description: 'Exclusive newsletter', available: true },
        { description: 'Priority booking', available: false },
        { description: 'Discount on merchandise', available: false }
      ]
    },
    silver: {
      name: 'Silver',
      color: '#C0C0C0',
      benefits: [
        { description: 'Early access to selected events', available: true },
        { description: 'Birthday gift', available: true },
        { description: 'Exclusive newsletter', available: true },
        { description: 'Priority booking', available: true },
        { description: 'Discount on merchandise', available: false }
      ]
    },
    gold: {
      name: 'Gold',
      color: '#FFD700',
      benefits: [
        { description: 'Early access to selected events', available: true },
        { description: 'Birthday gift', available: true },
        { description: 'Exclusive newsletter', available: true },
        { description: 'Priority booking', available: true },
        { description: 'Discount on merchandise', available: true }
      ]
    },
    platinum: {
      name: 'Platinum',
      color: '#E5E4E2',
      benefits: [
        { description: 'Early access to all events', available: true },
        { description: 'Premium birthday gift', available: true },
        { description: 'Exclusive newsletter', available: true },
        { description: 'VIP booking', available: true },
        { description: 'Exclusive discounts on merchandise', available: true }
      ]
    }
  };
  
  notificationOptions = [
    { value: 'email', viewValue: 'Email' },
    { value: 'sms', viewValue: 'SMS' },
    { value: 'push', viewValue: 'Push Notification' }
  ];

  constructor(
    private loyaltyService: LoyaltyProgramService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.preferencesForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [false],
      pushNotifications: [true]
    });
    
    this.joinForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      notifications: this.fb.group({
        email: [true],
        sms: [false],
        push: [false]
      }),
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.checkMembership();
  }

  checkMembership(): void {
    this.isLoading = true;
    this.loyaltyService.checkMembership().subscribe({
      next: (result) => {
        this.isMember = result.is_member;
        
        if (this.isMember) {
          this.loadMembershipDetails();
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error checking membership:', error);
        this.isLoading = false;
      }
    });
  }

  loadMembershipDetails(): void {
    this.loyaltyService.getUserMembership().subscribe({
      next: (membership) => {
        this.membership = membership;
        if (membership && membership.preferences) {
          this.preferencesForm.patchValue({
            emailNotifications: membership.preferences['emailNotifications'] ?? true,
            smsNotifications: membership.preferences['smsNotifications'] ?? false,
            pushNotifications: membership.preferences['pushNotifications'] ?? true
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading membership details:', error);
        this.isLoading = false;
      }
    });
  }

  joinLoyaltyProgram(): void {
    if (this.joinForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    // Only send notification preferences to the loyalty program
    const preferences = {
      emailNotifications: this.joinForm.value.notifications.email,
      smsNotifications: this.joinForm.value.notifications.sms,
      pushNotifications: this.joinForm.value.notifications.push
    };

    this.loyaltyService.joinProgram(preferences).subscribe({
      next: (result) => {
        if (result) {
          this.snackBar.open('You have successfully joined the loyalty program!', 'Close', {
            duration: 5000
          });
          this.isMember = true;
          this.membership = result;
          this.preferencesForm.patchValue({
            emailNotifications: preferences.emailNotifications,
            smsNotifications: preferences.smsNotifications,
            pushNotifications: preferences.pushNotifications
          });
        } else {
          this.snackBar.open('Failed to join the loyalty program. Please try again.', 'Close', {
            duration: 5000
          });
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error joining loyalty program:', error);
        this.snackBar.open('An error occurred. Please try again later.', 'Close', {
          duration: 5000
        });
        this.isSubmitting = false;
      }
    });
  }

  updatePreferences(): void {
    if (this.preferencesForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const preferences = {
      emailNotifications: this.preferencesForm.value.emailNotifications,
      smsNotifications: this.preferencesForm.value.smsNotifications,
      pushNotifications: this.preferencesForm.value.pushNotifications
    };

    this.loyaltyService.updatePreferences(preferences).subscribe({
      next: (result) => {
        if (result) {
          this.snackBar.open('Preferences updated successfully!', 'Close', {
            duration: 3000
          });
          this.membership = result;
        } else {
          this.snackBar.open('Failed to update preferences. Please try again.', 'Close', {
            duration: 3000
          });
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating preferences:', error);
        this.snackBar.open('An error occurred. Please try again later.', 'Close', {
          duration: 3000
        });
        this.isSubmitting = false;
      }
    });
  }

  leaveLoyaltyProgram(): void {
    if (confirm('Are you sure you want to leave the loyalty program? Your points and benefits will be lost.')) {
      this.isSubmitting = true;
      this.loyaltyService.deactivate().subscribe({
        next: (result) => {
          if (result) {
            this.snackBar.open('You have left the loyalty program.', 'Close', {
              duration: 5000
            });
            this.isMember = false;
            this.membership = null;
          } else {
            this.snackBar.open('Failed to leave the loyalty program. Please try again.', 'Close', {
              duration: 5000
            });
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error leaving loyalty program:', error);
          this.snackBar.open('An error occurred. Please try again later.', 'Close', {
            duration: 5000
          });
          this.isSubmitting = false;
        }
      });
    }
  }

  getTierColor(tier: string): string {
    return this.tiers[tier].color;
  }

  getCurrentTier(): MembershipTier {
    return this.tiers[this.membership?.tier ?? 'bronze'];
  }

  getProgressToNextTier(): number {
    if (!this.membership) return 0;
    
    const tierThresholds = {
      'bronze': 200,  // Points needed to advance from Bronze to Silver
      'silver': 500,  // Points needed to advance from Silver to Gold
      'gold': 1000,   // Points needed to advance from Gold to Platinum
      'platinum': Infinity // No tier beyond Platinum
    };
    
    const currentTier = this.membership.tier;
    const currentPoints = this.membership.points;
    const pointsNeededForNextTier = tierThresholds[currentTier];
    
    // If at max tier, show 100% progress
    if (currentTier === 'platinum') return 100;
    
    // Calculate progress percentage
    return Math.min(100, (currentPoints / pointsNeededForNextTier) * 100);
  }
}
