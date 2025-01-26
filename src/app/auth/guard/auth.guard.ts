import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, User } from '../auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map((user) => {
        if (user && user.role === 'admin') {
          return true; // Allow access if user is admin
        } else {
          this.router.navigate(['/auth/login']); // Redirect to login if not allowed
          return false;
        }
      })
    );
  }
}
