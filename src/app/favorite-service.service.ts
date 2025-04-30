import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../environments/environment';
import { httpHelper } from "./utils/HttpHelper";

export interface FavoriteResponse {
  detail: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/events/favorites`;

  constructor(private http: HttpClient) { }

  markFavorite(userId: number, eventId: number): Observable<FavoriteResponse> {
    const url = `${this.apiUrl}/mark_favorite/`;
    return this.http.post<FavoriteResponse>(url, {
      user_id: userId,
      event_id: eventId
    }, { headers: httpHelper.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Error marking event as favorite', error);
        return of({ detail: 'Failed to mark as favorite' });
      })
    );
  }

  removeFavorite(userId: number, eventId: number): Observable<FavoriteResponse> {
    const url = `${this.apiUrl}/remove_favorite/`;
    return this.http.post<FavoriteResponse>(url, {
      user_id: userId,
      event_id: eventId
    }, { headers: httpHelper.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Error removing event from favorites', error);
        return of({ detail: 'Failed to remove from favorites' });
      })
    );
  }

  getUserFavorites(userId: number): Observable<number[]> {
    // This endpoint doesn't exist in your backend yet - you may need to add it
    const url = `${this.apiUrl}/user/${userId}/`;
    return this.http.get<number[]>(url, { headers: httpHelper.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching user favorites', error);
        return of([]);
      })
    );
  }
}
