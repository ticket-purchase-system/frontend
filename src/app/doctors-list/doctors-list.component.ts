import { Component } from '@angular/core';
import { AuthService, User } from '../auth/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-doctors-list',
  templateUrl: './doctors-list.component.html',
  styleUrl: './doctors-list.component.scss'
})
export class DoctorsListComponent {
  users: User[] = [];
  isLoading: boolean = true;

  constructor(private router: Router, private authService: AuthService) {
    this.fetchUsers();
  }

  private fetchUsers(): void {
    this.authService.getDoctors().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.isLoading = false;
      },
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']); // Redirect to login page
  }
}
