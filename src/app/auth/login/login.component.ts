import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.errorMessage = '';
        this.router.navigate(['/calendar']);
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password';
        } else {
          console.error('Login error', err);
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      }
    });
  }
  

  navigateToSignup(): void {
    this.router.navigate(['/auth/signup']); // Redirect to signup page
  }

  enterAsGuest(): void {
    this.router.navigate(['/doctors']); // Redirect to the doctors list
  }

  
}
  