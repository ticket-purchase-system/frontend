import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
// import { AngularFireDatabase } from '@angular/fire/compat/database';


// Interface for Appointment data
export interface Appointment {
  id?: string;
  date: string;
  title: string;
  startTime: string;
  endTime: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  // private appointmentsRef = this.db.list('https://edoctorapp-d1d18-default-rtdb.europe-west1.firebasedatabase.app/appointments.json');
  private apiUrl = 'http://localhost:3000/appointments';  // The URL where JSON Server is running
  // private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient,
              // private db: AngularFireDatabase
              ) { }

  // Fetch appointments from db.json
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((appointments) =>
        appointments.map((appointment) => ({
          ...appointment,
          id: appointment._id || appointment.id, // Map _id to id if it exists
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

  //firebase
  // getAppointments_from_firebase(): Observable<any[]> {
  //   return this.appointmentsRef.valueChanges(); // Fetches the data as an observable
  // }
  
  }
