import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, Observable, of} from 'rxjs';
import {environment} from "../environments/environment";
import {httpHelper} from "./utils/HttpHelper";
import {map} from "rxjs/operators";

export interface Review {
  id?: number;
  numberOfStars: string;
  comment: string;
  date?: string;
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  addReview(orderId: number, review: Review): Observable<Review> {
    const url = `${this.apiUrl}/orders/${orderId}/add_review/`;
    const headers = httpHelper.getAuthHeaders();

    return this.http.post<Review>(url, review, { headers });
  }

  updateReview(orderId: number, review: Review): Observable<Review> {
    const url = `${this.apiUrl}/orders/${orderId}/update_review/`;
    const headers = httpHelper.getAuthHeaders();

    return this.http.put<Review>(url, review, { headers });
  }

  deleteReview(orderId: number): Observable<void> {
    const url = `${this.apiUrl}/orders/${orderId}/delete_review/`;
    const headers = httpHelper.getAuthHeaders();

    return this.http.delete<void>(url, { headers });
  }

  getProductReviews(eventId: number): Observable<Review[]> {

    console.log('fetching ')
    const headers = httpHelper.getAuthHeaders();
    return this.http.get<Review[]>(`${this.apiUrl}/product_reviews/?product_id=${eventId}`, { headers });
  }

  // getProductReviews(eventId: number): Observable<Review[]> {
  //   if (!eventId) {
  //     console.warn('Invalid product ID provided:', eventId);
  //     return of([]);
  //   }
  //
  //   return this.http.get<Review[]>(`${this.apiUrl}/product/${eventId}`).pipe(
  //     map(reviews => {
  //       return reviews.map(review => ({
  //         ...review,
  //         numberOfStars: typeof review.numberOfStars === 'string' ?
  //           parseInt(review.numberOfStars, 10) : review.numberOfStars
  //       }));
  //     }),
  //     catchError(error => {
  //       console.error('Error fetching reviews:', error);
  //       return of([]);
  //     })
  //   );
  // }

}
