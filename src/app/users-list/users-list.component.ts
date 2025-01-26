import { Component } from '@angular/core';
import { AuthService, User } from '../auth/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UserListComponent {
  users: User[] = [];
  isLoading: boolean = true;

  constructor(private authService: AuthService) {
    this.fetchUsers();
  }

  private fetchUsers(): void {
    this.authService.getAllUsers().subscribe({
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

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter((user) => user.id !== userId); // Remove user locally
        },
        error: (err) => {
          console.error('Error deleting user:', err);
        },
      });
    }
  }
}
