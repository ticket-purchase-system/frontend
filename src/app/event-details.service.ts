import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../environments/environment";
import {httpHelper} from "./utils/HttpHelper";

export interface EventDetails {
  id: number;
  event: number;
  rules_text: string | null;
  rules_pdf: any;
  rules_pdf_url: string | null;
  attachments: EventAttachment[];
}

export interface EventAttachment {
  id: number;
  title: string;
  description: string | null;
  file: any;
  file_url: string;
  uploaded_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventDetailsService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getEventDetails(eventId: number): Observable<EventDetails> {
    return this.http.get<EventDetails>(`${this.apiUrl}/events/${eventId}/details/`, { headers: httpHelper.getAuthHeaders() });
  }

  updateEventDetails(eventDetailsId: number, data: FormData): Observable<EventDetails> {
    return this.http.put<EventDetails>(`${this.apiUrl}/event-details/${eventDetailsId}/`, data,
      { headers: httpHelper.getAuthHeaderWithoutContentType() });
  }

  createEventDetails(eventId: number, data: FormData): Observable<EventDetails> {
    const formData = new FormData();
    formData.append('event', eventId.toString());

    if (data.has('rules_text')) {
      formData.append('rules_text', data.get('rules_text') as string);
    }
    if (data.has('rules_pdf')) {
      formData.append('rules_pdf', data.get('rules_pdf') as File);
    }

    return this.http.post<EventDetails>(`${this.apiUrl}/api/event-details/`, formData, { headers: httpHelper.getAuthHeaders() });
  }

  downloadRulesPdf(eventDetailsId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/event-details/${eventDetailsId}/download-rules/`, {
      responseType: 'blob',
      headers: httpHelper.getAuthHeaders()
    });
  }

  getAttachments(eventDetailsId: number): Observable<EventAttachment[]> {
    return this.http.get<EventAttachment[]>(
      `${this.apiUrl}/attachments/by_event_details/?event_details=${eventDetailsId}`,
      { headers: httpHelper.getAuthHeaders() }
    );
  }

  uploadAttachment(eventDetailsId: number, title: string, description: string, file: File): Observable<EventAttachment> {
    const formData = new FormData();
    formData.append('event_details', eventDetailsId.toString());
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);

    return this.http.post<EventAttachment>(`${this.apiUrl}/api/attachments/`, formData, { headers: httpHelper.getAuthHeaders() });
  }

  deleteAttachment(attachmentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/attachments/${attachmentId}/`, { headers: httpHelper.getAuthHeaders() });
  }

  downloadAttachment(attachmentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/attachments/${attachmentId}/download/`, {
      responseType: 'blob',
      headers: httpHelper.getAuthHeaders()
    });
  }
}
