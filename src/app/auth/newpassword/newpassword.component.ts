import { Component } from '@angular/core';
import { AuthService, User } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-newpassword',
  templateUrl: './newpassword.component.html',
  styleUrls: ['./newpassword.component.scss'],
})
export class NewPasswordComponent {
  email = '';
  newPassword = '';
  confirmPassword = '';
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.successMessage = '';
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.authService.getAllUsers().subscribe({
      next: (users) => {
        const user = users.find((u) => u.username === this.email);

        if (!user) {
          this.successMessage = '';
          this.errorMessage = 'Email not found.';
        } else {
          const updatedUser = { ...user, password: this.newPassword };

          this.authService.updateUserPassword(updatedUser).subscribe({
            next: () => {
              this.successMessage = 'Password changed successfully!';
              this.errorMessage = '';
              setTimeout(() => this.router.navigate(['/auth/login']), 2000);
            },
            error: (err) => {
              console.error('Update error', err);
              this.successMessage = '';
              this.errorMessage = 'Something went wrong. Please try again.';
            },
          });
        }
      },
      error: (err) => {
        console.error('Error retrieving users', err);
        this.successMessage = '';
        this.errorMessage = 'Something went wrong. Please try again.';
      },
    });
  }
}
