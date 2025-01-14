import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// Interface for Appointment data
export interface Appointment {
  id?: string;
  date: Date;
  title: string;
  startTime: string;
  endTime: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private apiUrl = 'http://localhost:3000/appointments';  // The URL where JSON Server is running

  constructor(private http: HttpClient) { }

  // Fetch appointments from db.json
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl).pipe(
      map((appointments) =>
        appointments.map((appointment) => ({
          ...appointment,
          date: new Date(appointment.date), 
        }))
      )
    );
  }

 // Add a new appointment
 addAppointment(appointment: Appointment): Observable<Appointment> {
  return this.http.post<Appointment>(this.apiUrl, appointment);
}

  // Update an existing appointment
  updateAppointment(appointment: Appointment): Observable<Appointment> {
    if (!appointment.id) {
      throw new Error('Appointment must have a id to update');
    }
    const url = `${this.apiUrl}/${appointment.id}`;
    return this.http.put<Appointment>(url, appointment);
  }

  // Delete an appointment by ID
  deleteAppointment(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }
  }
