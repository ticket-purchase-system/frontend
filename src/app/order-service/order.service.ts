

export interface Order {
    products: Product[];
    id: Number;
    date: Date;
    price: Number;
    rabatCode: String;
    review: Review | null;
    phoneNumber: String;
    email: String;
    city: String;
    address: String;
  }
  
  export interface Product{
    price: Number;
    id: Number;
    description: String;
  }
  
  export interface Tickets extends  Product{
    sector: String;
    seat: Number | null;
  }
  
  export interface Review{
    id: Number;
    numberOfStars: Opinion;
    comment: String;
    date: Date;
    rating: Number;
  }
  
  export enum Opinion {
    ONE_STAR = 1,
    TWO_STARS = 2,
    THREE_STARS = 3,
    FOUR_STARS = 4,
    FIVE_STARS = 5
  }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { httpHelper } from '../utils/HttpHelper';


@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Pobiera historię zamówień konkretnego użytkownika
   */
  getUserOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(
      `${this.apiUrl}/user/${userId}`,
      { headers: httpHelper.getAuthHeaders() }
    );
  }

  /**
   * Pobiera pojedyncze zamówienie po ID
   */
  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(
      `${this.apiUrl}/${id}`,
      { headers: httpHelper.getAuthHeaders() }
    );
  }

  /**
   * Tworzy nowe zamówienie
   */
  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(
      this.apiUrl,
      order,
      { headers: httpHelper.getAuthHeaders() }
    );
  }

  /**
   * Aktualizuje istniejące zamówienie
   */
  updateOrder(id: number, changes: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(
      `${this.apiUrl}/${id}`,
      changes,
      { headers: httpHelper.getAuthHeaders() }
    );
  }

  /**
   * Usuwa zamówienie o podanym ID
   */
  deleteOrder(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: httpHelper.getAuthHeaders() }
    );
  }
}
