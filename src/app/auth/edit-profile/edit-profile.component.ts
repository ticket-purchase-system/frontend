import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent {
  user: User | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => (this.user = user),
      error: () => (this.errorMessage = 'Failed to load profile')
    });
  }

  saveChanges(): void {
    if (!this.user) return;

    this.authService.updateUserProfile(this.user).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully!';
        this.errorMessage = '';
      },
      error: () => {
        this.successMessage = '';
        this.errorMessage = 'Failed to update profile.';
      }
    });
  }

  deleteAccount(): void {
    if (!this.user) return;

    this.authService.deleteUser(this.user.id).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      },
      error: () => (this.errorMessage = 'Failed to delete account.')
    });
  }
}