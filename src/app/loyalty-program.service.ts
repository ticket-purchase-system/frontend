import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import {environment} from "../environments/environment";
import {httpHelper} from "./utils/HttpHelper";

export interface LoyaltyProgram {
  id?: number;
  username?: string;
  join_date?: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  is_active: boolean;
  preferences?: Record<string, any>;
  pointsToNextTier?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoyaltyProgramService {
  private apiUrl = `${environment.apiUrl}/loyalty-program`;

  constructor(private http: HttpClient) { }

  checkMembership(): Observable<{ is_member: boolean }> {
    return this.http.get<{ is_member: boolean }>(`${this.apiUrl}/check`, { headers: httpHelper.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Error checking membership:', error);
        return of({ is_member: false });
      })
    );
  }

  // Get current user's loyalty program details
  getUserMembership(): Observable<LoyaltyProgram | null> {
    return this.http.get<LoyaltyProgram>(`${this.apiUrl}/me`, { headers: httpHelper.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching membership:', error);
        return of(null);
      })
    );
  }

  // Join the loyalty program
  joinProgram(preferences?: Record<string, any>): Observable<LoyaltyProgram | null> {
    const data = preferences ? { preferences } : {};
    return this.http.post<LoyaltyProgram>(this.apiUrl, data, { headers: httpHelper.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Error joining loyalty program:', error);
        return of(null);
      })
    );
  }

  // Update loyalty program preferences
  updatePreferences(preferences: Record<string, any>): Observable<LoyaltyProgram | null> {
    return this.http.put<LoyaltyProgram>(`${this.apiUrl}/me`, { preferences }, { headers: httpHelper.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Error updating preferences:', error);
        return of(null);
      })
    );
  }

  // Deactivate loyalty program membership
  deactivate(): Observable<{ detail: string } | null> {
    return this.http.post<{ detail: string }>(`${this.apiUrl}/me/deactivate`, {}, { headers: httpHelper.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Error deactivating membership:', error);
        return of(null);
      })
    );
  }
}
