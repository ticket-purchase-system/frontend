import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../environments/environment';
import {httpHelper} from "./utils/HttpHelper";

export interface Event {
  id?: string;
  title: string;
  type: string;
  date: string;
  start_hour?: string;
  end_hour?: string;
  place?: string;
  price: number;
  seats_no?: number;
  description?: string;
  created_by: number;
  created_at?: string;
  artists?: number[];
}

export interface EventDetails {
  location?: string;
  rules?: string;
  max_attendees?: number;
  additional_info?: string;
}

export interface EventWithDetails {
  event: Event;
  details?: EventDetails;
  showReport?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`

  constructor(private http: HttpClient) { }

  getEvents(query?: string, startDate?: string, endDate?: string): Observable<EventWithDetails[]> {
    const url = this.apiUrl;
    const params: Record<string, string> = {};

    if (query) params['query'] = query;
    if (startDate) params['start_date'] = startDate;
    if (endDate) params['end_date'] = endDate;

    return this.http.get<EventWithDetails[]>(url, { params, headers: httpHelper.getAuthHeaders() }, ).pipe(
      catchError(error => {
        console.error('Error fetching events', error);
        return of([]);
      })
    );
  }

  getEvent(id: string): Observable<EventWithDetails> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<EventWithDetails>(url, { headers: httpHelper.getAuthHeaders() });
  }

  createEvent(event: Event): Observable<Event> {
    const url = `${this.apiUrl}/create_event/`;
    return this.http.post<Event>(url, event, { headers: httpHelper.getAuthHeaders() });
  }

  updateEvent(event: Event): Observable<Event> {
    const url = `${this.apiUrl}/${event.id}/update_event/`;
    return this.http.put<Event>(url, event, { headers: httpHelper.getAuthHeaders() });
  }

  deleteEvent(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}/`;
    return this.http.delete(url, { headers: httpHelper.getAuthHeaders() });
  }

  getPopularEvents(limit: number = 7): Observable<EventWithDetails[]> {
    const url = `${this.apiUrl}/popular/`;
    const params: Record<string, string> = { limit: limit.toString() };
    
    return this.http.get<EventWithDetails[]>(url, { params, headers: httpHelper.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching popular events', error);
        return of([]);
      })
    );
  }

  getPersonalizedEvents(filters: any = {}, limit: number = 10): Observable<EventWithDetails[]> {
    const url = `${this.apiUrl}/personalized/`;
    const params: Record<string, string | string[]> = { limit: limit.toString() };
    
    if (filters.types && filters.types.length > 0) {
      params['types'] = filters.types;
    }
    
    if (filters.keywords && filters.keywords.length > 0) {
      params['keywords'] = filters.keywords;
    }
    
    return this.http.get<EventWithDetails[]>(url, { params, headers: httpHelper.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching personalized events', error);
        return of([]);
      })
    );
  }
}
