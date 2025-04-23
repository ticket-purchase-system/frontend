import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../environments/environment";
import {httpHelper} from "./utils/HttpHelper";

export interface TechnicalIssue {
  id?: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TechnicalIssueService {
  private apiUrl = `${environment.apiUrl}/technical-issues`;

  constructor(private http: HttpClient) { }

  // Get all technical issues reported by the user
  getUserIssues(): Observable<TechnicalIssue[]> {
    return this.http.get<TechnicalIssue[]>(this.apiUrl, { headers: httpHelper.getAuthHeaders() });
  }

  // Get a specific technical issue by ID
  getIssue(id: number): Observable<TechnicalIssue> {
    return this.http.get<TechnicalIssue>(`${this.apiUrl}/${id}`, { headers: httpHelper.getAuthHeaders() });
  }

  // Create a new technical issue
  createIssue(issue: TechnicalIssue): Observable<TechnicalIssue> {
    return this.http.post<TechnicalIssue>(this.apiUrl, issue, { headers: httpHelper.getAuthHeaders() });
  }

  // Update an existing technical issue
  updateIssue(id: number, issue: Partial<TechnicalIssue>): Observable<TechnicalIssue> {
    return this.http.put<TechnicalIssue>(`${this.apiUrl}/${id}`, issue, { headers: httpHelper.getAuthHeaders() });
  }

  // Delete a technical issue
  deleteIssue(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: httpHelper.getAuthHeaders() });
  }
}
