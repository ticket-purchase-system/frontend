import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
// import { AngularFireDatabase } from '@angular/fire/compat/database';


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

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {


  private apiUrl = environment.apiUrl;
  private absenceApiUrl =  environment.absenceApiUrl;

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

  // Method to add a new absence
  addAbsence(absence: Absence): Observable<Absence> {
    return this.http.post<Absence>(this.absenceApiUrl, absence);
  }

  // Method to fetch absences (if needed for other operations)
  getAbsences(): Observable<Absence[]> {
    return this.http.get<any[]>(this.absenceApiUrl).pipe(
      map((absences) =>
        absences.map((absence) => ({
          ...absence,
          id: absence._id || absence.id, // Map _id to id if it exists
        }))
      )
    );
  }
  
  }
