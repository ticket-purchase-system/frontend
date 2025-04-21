import { Component } from '@angular/core';
import { AuthService, User } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  username = '';
  password = '';
  role = 'user'; // Default role
  successMessage = '';
  errorMessage = '';
  firstName = '';
  lastName = '';
  email = '';

  constructor(private authService: AuthService, private router: Router) {}

  signup(): void {
    console.log('Form values:', {
      username: this.username,
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
    });

    const newUser = {
      user: {
        username: this.username,
        password: this.password,
        email: this.email
      },
      first_name: this.firstName,
      last_name: this.lastName,
      role: this.role
    };

    // Check if username exists
    this.authService.checkUsernameExists(this.username).subscribe({
      next: (exists) => {
        if (exists) {
          this.successMessage = '';
          this.errorMessage = 'Username already exists. Please choose another one.';
        } else {
          // Create user if username does not exist
          this.authService.createUser(newUser).subscribe({
            next: () => {
              this.successMessage = 'Account created successfully!';
              this.errorMessage = '';
              setTimeout(() => this.router.navigate(['/auth/login']), 2000); // Redirect to login
            },
            error: (err) => {
              console.error('Signup error', err);
              this.successMessage = '';
              this.errorMessage = 'Something went wrong. Please try again.';
            },
          });
        }
      },
      error: (err) => {
        console.error('Error checking username', err);
        this.successMessage = '';
        this.errorMessage = 'Something went wrong. Please try again.';
      },
    });
  }
}
