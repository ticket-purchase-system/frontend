import { Component, OnInit } from '@angular/core';
import { AppointmentService, Appointment } from '../appointment.service';  // Zaimportuj AppointmentService i Appointment

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss'],
})
export class BasketComponent implements OnInit {

  appointments: Appointment[] = [];  // Tablica, która przechowa wszystkie spotkania
  errorMessage: string = '';  // Do przechowywania komunikatu o błędzie (jeśli wystąpi)

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();  // Załaduj dane przy inicjalizacji komponentu
  }

  startPayment(): void {
    console.log('Payment process started!');
  }
  

  // Metoda do załadowania danych o spotkaniach
  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;  // Przypisz pobrane dane do tablicy
      },
      error: (error) => {
        this.errorMessage = 'Nie udało się załadować spotkań';  // Obsługuje błąd, jeśli wystąpi
      }
    });
  }
}
