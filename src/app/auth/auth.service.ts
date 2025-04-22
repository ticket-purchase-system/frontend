import { Injectable } from '@angular/core';
import { HttpClient,  HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, switchMap, of } from 'rxjs';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  user: {
    username?: string;
    email?: string;
  };
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {}

  // Method to verify user credentials and generate JWT tokens
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/token/`, { username, password }).pipe(
      tap((res: any) => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        this.loadUserProfile(username).subscribe(); // Load user info if needed
      })
    );
  }

  loadUserProfile(username: string): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/users/${username}`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  checkUsernameExists(username: string): Observable<boolean> {
    return this.getAllUsers().pipe(
      switchMap((users) =>
        of(users.some((user) => user.user.username === username))
      )
    );
  }
  

  deleteUser(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  createUser(user: any): Observable<User> {
    console.log('Sending user payload:', {
      user: {
        username: user.username,
        password: user.password,
        email: user.email
      },
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    });
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }
  
  

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
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

  updateUserPassword(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user);
  }
  
}
