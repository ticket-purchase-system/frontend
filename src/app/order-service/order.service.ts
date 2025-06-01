import {Review} from "../review-service.service";

export interface Order {
    products: Product[];
    id: number;
    date: Date;
    price: number;
    rabatCode: string;
    review: Review | null;
    phoneNumber: string;
    email: string;
    city: string;
    address: string;
  }

  export interface Product{
    price: number;
    id: number;
    description: string;
  }

  export interface Tickets extends  Product{
    sector: string;
    seat: number | null;
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

createProduct(product: any): Observable<any> {
  return this.http.post(
    `${environment.apiUrl}/products/`,
    product,
    { headers: httpHelper.getAuthHeaders() }
  );
}



}
