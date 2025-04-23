import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../environments/environment';
import {httpHelper} from "./utils/HttpHelper";

export interface Artist {
  id: number;
  name: string;
  genre?: string;
  bio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private apiUrl = `${environment.apiUrl}/artists`;

  constructor(private http: HttpClient) { }

  getArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(this.apiUrl, { headers: httpHelper.getAuthHeaders() }).pipe(
      catchError(error => {
        console.error('Error fetching artists', error);
        return of([]);
      })
    );
  }

  getArtist(id: number): Observable<Artist> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Artist>(url);
  }

  createArtist(artist: Artist): Observable<Artist> {
    return this.http.post<Artist>(this.apiUrl + '/', artist,  { headers: httpHelper.getAuthHeaders() });
  }

  updateArtist(artist: Artist): Observable<Artist> {
    const url = `${this.apiUrl}/${artist.id}/`;
    return this.http.put<Artist>(url, artist,  { headers: httpHelper.getAuthHeaders() });
  }

  deleteArtist(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url,  { headers: httpHelper.getAuthHeaders() });
  }
}
