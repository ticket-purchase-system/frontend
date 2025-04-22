import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map((user) => {

        const allowedRoles = route.data['allowedRoles'];

        if (!user || !user.role || !allowedRoles.includes(user.role)) {
          this.router.navigate(['/calendar']); // Redirect to calendar if not allowed
          return false;
        } else {
          return true; // Allow access if user has the required role
        }

      })
    );
  }
}
