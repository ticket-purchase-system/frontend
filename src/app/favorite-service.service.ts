import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, BehaviorSubject, tap } from 'rxjs';
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
  
  // Reactive state for favorites
  private favoritesSubject = new BehaviorSubject<number[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Get current favorites array value
  getCurrentFavorites(): number[] {
    return this.favoritesSubject.value;
  }

  // Update the favorites state
  private updateFavorites(favorites: number[]): void {
    this.favoritesSubject.next(favorites);
  }

  markFavorite(userId: number, eventId: number): Observable<FavoriteResponse> {
    const url = `${this.apiUrl}/mark_favorite/`;
    return this.http.post<FavoriteResponse>(url, {
      user_id: userId,
      event_id: eventId
    }, { headers: httpHelper.getAuthHeaders() }).pipe(
      tap(() => {
        // Add to local favorites array when successful
        const currentFavorites = this.getCurrentFavorites();
        if (!currentFavorites.includes(eventId)) {
          this.updateFavorites([...currentFavorites, eventId]);
        }
      }),
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
      tap(() => {
        // Remove from local favorites array when successful
        const currentFavorites = this.getCurrentFavorites();
        this.updateFavorites(currentFavorites.filter(id => id !== eventId));
      }),
      catchError(error => {
        console.error('Error removing event from favorites', error);
        return of({ detail: 'Failed to remove from favorites' });
      })
    );
  }

  getUserFavorites(userId: number): Observable<number[]> {
    const url = `${this.apiUrl}/user/${userId}/`;
    return this.http.get<number[]>(url, { headers: httpHelper.getAuthHeaders() }).pipe(
      tap(favorites => {
        // Update the reactive state when we fetch favorites
        this.updateFavorites(favorites);
      }),
      catchError(error => {
        console.error('Error fetching user favorites', error);
        this.updateFavorites([]); // Set empty array on error
        return of([]);
      })
    );
  }
}
