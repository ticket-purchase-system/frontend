import { Injectable } from '@angular/core';
import { Database, ref, set, push, remove, update, onValue, off } from '@angular/fire/database';
import { Observable, from } from 'rxjs';
import { Appointment, Absence } from '../appointment.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private db: Database) {}

  // Appointments
  getAppointments(): Observable<Appointment[]> {
    return new Observable(observer => {
      const appointmentsRef = ref(this.db, 'appointments');
      onValue(appointmentsRef, (snapshot) => {
        const appointments: Appointment[] = [];
        snapshot.forEach((childSnapshot) => {
          appointments.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        observer.next(appointments);
      });

      // Cleanup subscription when unsubscribed
      return () => off(appointmentsRef);
    });
  }

  addAppointment(appointment: Appointment): Observable<any> {
    const appointmentsRef = ref(this.db, 'appointments');
    const newAppointmentRef = push(appointmentsRef);
    return from(set(newAppointmentRef, appointment));
  }

  updateAppointment(appointment: Appointment): Observable<any> {
    const { id, ...appointmentData } = appointment;
    const appointmentRef = ref(this.db, `appointments/${id}`);
    return from(update(appointmentRef, appointmentData));
  }

  deleteAppointment(id: string): Observable<any> {
    const appointmentRef = ref(this.db, `appointments/${id}`);
    return from(remove(appointmentRef));
  }

  // Absences
  getAbsences(): Observable<Absence[]> {
    return new Observable(observer => {
      const absencesRef = ref(this.db, 'absences');
      onValue(absencesRef, (snapshot) => {
        const absences: Absence[] = [];
        snapshot.forEach((childSnapshot) => {
          absences.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        observer.next(absences);
      });

      // Cleanup subscription when unsubscribed
      return () => off(absencesRef);
    });
  }

  addAbsence(absence: Absence): Observable<any> {
    const absencesRef = ref(this.db, 'absences');
    const newAbsenceRef = push(absencesRef);
    return from(set(newAbsenceRef, absence));
  }
} 