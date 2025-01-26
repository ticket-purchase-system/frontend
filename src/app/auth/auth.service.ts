import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users'; // Adjust the URL as needed
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {}

  // Method to verify user credentials
  login(username: string, password: string): Observable<User | null> {
    return new Observable((observer) => {
      this.http.get<User[]>(this.apiUrl).subscribe({
        next: (users) => {
          const user = users.find(
            (u) => u.username === username && u.password === password
          );
          if (user) {
            this.currentUserSubject.next(user); // Set logged-in user
          }
          observer.next(user || null); // Return user if found, otherwise null
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  checkUsernameExists(username: string): Observable<boolean> {
    return new Observable((observer) => {
      this.http.get<User[]>(this.apiUrl).subscribe({
        next: (users) => {
          const exists = users.some((u) => u.username === username);
          observer.next(exists); // Return true if username exists, otherwise false
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  deleteUser(userId: number): Observable<void> {
    const url = `${this.apiUrl}/${userId}`; // API endpoint for deleting a user
    return this.http.delete<void>(url); // Delete user from the backend
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user); // Add user to db.json
  }


  logout(): void {
    this.currentUserSubject.next(null); // Clear logged-in user
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getDoctors(): Observable<User[]> {
    return new Observable((observer) => {
      this.http.get<User[]>(this.apiUrl).subscribe({
        next: (users) => {
          const doctors = users.filter((user) => user.role === 'doctor'); // Filter users by role
          observer.next(doctors); // Return the list of doctors
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }
  
  
}
