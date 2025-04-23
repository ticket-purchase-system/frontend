import { Component, OnInit } from '@angular/core';
import { EventService, EventWithDetails } from '../event.service';  // Zaimportuj EventService i Appointment

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss'],
})
export class BasketComponent implements OnInit {

  events: EventWithDetails[] = [];  // Tablica, która przechowa wszystkie spotkania
  errorMessage: string = '';  // Do przechowywania komunikatu o błędzie (jeśli wystąpi)

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadAppointments();  // Załaduj dane przy inicjalizacji komponentu
  }

  startPayment(): void {
    console.log('Payment process started!');
  }


  // Metoda do załadowania danych o spotkaniach
  loadAppointments(): void {
    this.eventService.getEvents().subscribe({
      next: (appointments) => {
        this.events = appointments;  // Przypisz pobrane dane do tablicy
      },
      error: (error) => {
        this.errorMessage = 'Nie udało się załadować spotkań';  // Obsługuje błąd, jeśli wystąpi
      }
    });
  }
}
