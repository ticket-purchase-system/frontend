import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';


console.log('[INTERCEPTOR DZIAŁA]');

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('[INTERCEPTOR] Intercepted URL:', req.url);
    const token = localStorage.getItem('access_token');
    console.log('[INTERCEPTOR DZIAŁA] token:', token);
  
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }
  
    return next.handle(req);
  }
  
}
