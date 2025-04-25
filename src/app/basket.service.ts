import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { httpHelper } from './utils/HttpHelper';

@Injectable({ providedIn: 'root' })
export class BasketService {
  private apiUrl = `${environment.apiUrl}/basket`;

  constructor(private http: HttpClient) {}

  getBasket(): Observable<any[]> {
    console.log('[BasketService] Wysyłam GET do koszyka');
    return this.http.get<any[]>(this.apiUrl, {
      headers: httpHelper.getAuthHeaders() // 👈 dodaj nagłówki
    });
  }

  addToBasket(item: any): Observable<any> {
    const payload = {
      event: item.event,
      seat: item.seat,
      quantity: item.quantity,
      is_group: item.is_group  // 🐍 snake_case!
    };
  
    console.log('[addToBasket] wysyłam:', payload);
  
    return this.http.post(this.apiUrl + '/add', payload, {
      headers: httpHelper.getAuthHeaders()
    });
  }

  removeFromBasket(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${itemId}`, {
      headers: httpHelper.getAuthHeaders() // 👈 dodaj nagłówki
    });
  }
}
