import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private apiUrl = 'http://localhost:8000/api/users'; // Point to Django backend
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {
    // Try to initialize user from token on startup
    this.initUserFromToken();
  }

  // Initialize user from token if available
  private initUserFromToken(): void {
    const token = localStorage.getItem('access_token');
    console.log('[AuthService] Zapisano token:', localStorage.getItem('access_token'));
    if (token) {
      // If we have a token, fetch the user data
      this.http.get<any[]>(this.apiUrl, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      }).subscribe({
        next: (users) => {
          // Find the current user (we don't know their username yet, so just take the first one that matches)
          if (users && users.length > 0) {
            const userData: User = {
              id: users[0].id,
              username: users[0].user.username,
              password: '', // Don't store password
              role: users[0].role
            };
            this.currentUserSubject.next(userData);
          }
        },
        error: (err) => {
          console.error('Error initializing user from token:', err);
          // If there's an error loading the user, clear the tokens
          this.logout();
        }
      });
    }
  }

  // Method to verify user credentials
  login(username: string, password: string): Observable<User | null> {
    return new Observable((observer) => {
      // Use JWT token authentication endpoint
      this.http.post<any>('http://localhost:8000/api/token/', {
        username: username,
        password: password
      }).subscribe({
        next: (response) => {
          // Store the tokens in localStorage
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          
          // If authentication successful, fetch user details
          this.http.get<any[]>(this.apiUrl).subscribe({
            next: (users) => {
              // Find user by username
              const user = users.find(u => {
                // The user data structure from Django is nested with 'user' property 
                // containing username
                return u.user && u.user.username === username;
              });
              
              if (user) {
                // Map to expected User format
                const userData: User = {
                  id: user.id,
                  username: user.user.username,
                  password: '', // Don't store password
                  role: user.role
                };
                this.currentUserSubject.next(userData);
                observer.next(userData);
              } else {
                observer.next(null);
              }
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        },
        error: (err) => {
          console.error('Login failed:', err);
          observer.next(null);
          observer.complete();
        }
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
    // Transform to match Django backend's expected format
    const formattedData = {
      user: {
        username: user.username,
        email: user.username + '@example.com', // Since email isn't in our User interface
        password: user.password
      },
      first_name: user.username, // Using username as placeholder
      last_name: user.username, // Using username as placeholder
      role: user.role
    };
    
    return new Observable<User>((observer) => {
      this.http.post<any>(this.apiUrl, formattedData).subscribe({
        next: (response) => {
          // Map the response to match the frontend User format
          const createdUser: User = {
            id: response.id,
            username: response.user.username,
            password: '', // Don't store password
            role: response.role
          };
          observer.next(createdUser);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  logout(): void {
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
