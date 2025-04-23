import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService, User } from '../auth.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // First check if there's a token in localStorage
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      this.router.navigate(['/auth/login']);
      return of(false);
    }
    
    // If there's a token, verify the user is logged in
    return this.authService.getCurrentUser().pipe(
      map((user) => {
        if (user) {
          return true; // Allow access for any authenticated user
        } else {
          this.router.navigate(['/auth/login']);
          return false;
        }
      }),
      catchError((error) => {
        console.error('Auth guard error:', error);
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}
