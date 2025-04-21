import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private http: HttpClient) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = localStorage.getItem('access_token');
    const isPublic = request.url.includes('/api/token/');

    // Add Authorization header if token exists and not public route
    if (accessToken && !isPublic) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !isPublic) {
          // Token might be expired, try refreshing
          return this.refreshToken().pipe(
            switchMap((newToken: string) => {
              // Retry the original request with new access token
              const retryReq = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next.handle(retryReq);
            }),
            catchError(err => {
              this.handleLogout(); // Optional: force logout on failed refresh
              return throwError(() => err);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }

  private refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.post<any>('/api/token/refresh/', {
      refresh: refreshToken
    }).pipe(
      switchMap((res) => {
        const newAccess = res.access;
        localStorage.setItem('access_token', newAccess);
        return new Observable<string>((observer) => {
          observer.next(newAccess);
          observer.complete();
        });
      })
    );
  }

  private handleLogout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Optionally redirect to login
    window.location.href = '/login';
  }
}
