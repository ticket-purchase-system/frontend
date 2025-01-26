import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { catchError, switchMap } from 'rxjs/operators';

export interface Appointment {
  id?: string;
  date: string;
  name_and_surname: string;
  type: string;
  age: number;
  gender?: string;
  startTime: string;
  endTime: string;
  additional_info?: string;
  color?: string;
}

export interface Absence {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface Presence {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private baseUrl = 'https://edoctorapp-d1d18-default-rtdb.europe-west1.firebasedatabase.app/';
  private appointmentUrl = environment.apiUrl;
  private absenceApiUrl =  environment.absenceApiUrl;
  private presenceApiUrl = 'http://localhost:3000/presence';

  constructor(private http: HttpClient,
              // private db: AngularFireDatabase
              ) { }

  // Fetch appointments from db.json
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<any[]>(this.appointmentUrl).pipe(
      map((appointments) => {
        return appointments.map(appointment => ({
          ...appointment,
          id: appointment._id || appointment.id // Map _id to id if it exists
        }));
      }),
      catchError(() => {
        // If localhost is not running, fallback to Firebase
        console.warn('Localhost is not running. Falling back to Firebase.');
        return this.http.get<{ [key: string]: Appointment }>(`${this.baseUrl}/appointments.json`).pipe(
          map(response => {
            if (!response) return [];
            return Object.keys(response).map(key => ({
              id: key,
              ...response[key]
            }));
          })
        );
      })
    );
  }


  // Appointments
  addAppointment(appointment: Appointment): Observable<any> {
    return this.http.post(this.appointmentUrl, appointment).pipe(
      catchError(() => {
        console.warn('Localhost is not running. Falling back to Firebase.');
        return this.http.post(`${this.baseUrl}/appointments.json`, appointment);
      })
    );
  }

  updateAppointment(appointment: Appointment): Observable<any> {
    const url = `${this.appointmentUrl}/${appointment.id}`;
    return this.http.put(url, appointment).pipe(
      catchError(() => {
        console.warn('Localhost is not running. Falling back to Firebase.');
        const { id, ...appointmentData } = appointment;
        return this.http.put(`${this.baseUrl}/appointments/${id}.json`, appointmentData);
      })
    );
  }

  deleteAppointment(id: string): Observable<any> {
    const url = `${this.appointmentUrl}/${id}`;
    return this.http.delete(url).pipe(
      catchError(() => {
        console.warn('Localhost is not running. Falling back to Firebase.');
        return this.http.delete(`${this.baseUrl}/appointments/${id}.json`);
      })
    );
  }

  // Absences
  getAbsences(): Observable<Absence[]> {
    return this.http.get<any[]>(this.absenceApiUrl).pipe(
      map(absences =>
        absences.map(absence => ({
          ...absence,
          id: absence._id || absence.id, // Map _id to id if it exists
        }))
      ),
      catchError(() => {
        console.warn('Localhost is not running. Falling back to Firebase.');
        return this.http.get<{ [key: string]: Absence }>(`${this.baseUrl}/absences.json`).pipe(
          map(response => {
            if (!response) return [];
            return Object.keys(response).map(key => ({
              id: key,
              ...response[key]
            }));
          })
        );
      })
    );
  }

  addAbsence(absence: Absence): Observable<any> {
    return this.http.post(this.absenceApiUrl, absence).pipe(
      catchError(() => {
        console.warn('Localhost is not running. Falling back to Firebase.');
        return this.http.post(`${this.baseUrl}/absences.json`, absence);
      })
    );
  }

  // Presences
  getPresences(): Observable<Presence[]> {
    return this.http.get<any[]>(this.presenceApiUrl).pipe(
      map(presences =>
        presences.map(presence => ({
          ...presence,
          id: presence._id || presence.id, // Map _id to id if it exists
        }))
      ),
      catchError(() => {
        console.warn('Localhost is not running. Falling back to Firebase.');
        return this.http.get<{ [key: string]: Presence }>(`${this.baseUrl}/presences.json`).pipe(
          map(response => {
            if (!response) return [];
            return Object.keys(response).map(key => ({
              id: key,
              ...response[key]
            }));
          })
        );
      })
    );
  }

  addPresence(presence: Presence): Observable<any> {
    return this.http.post(this.presenceApiUrl, presence).pipe(
      catchError(() => {
        console.warn('Localhost is not running. Falling back to Firebase.');
        return this.http.post(`${this.baseUrl}/presences.json`, presence);
      })
    );
  }
}