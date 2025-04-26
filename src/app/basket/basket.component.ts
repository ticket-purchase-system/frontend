import { BasketService } from './../basket.service';
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

  constructor(private eventService: EventService, private basketService: BasketService) {}

  ngOnInit(): void {
    this.basketService.getBasket().subscribe({
      next: (items) => {
        console.log('Dane z backendu:', items);

        // Dla uproszczenia – pobierz wszystkie eventy i przypisz do każdego ticketu
        this.eventService.getEvents().subscribe(events => {
          this.events = items.map(ticket => {
            const eventDetails = events.find(e => e.event.id === ticket.event);
            return {
              ...ticket,
              event: eventDetails?.event // <- przypisujemy pełny obiekt eventu
            };
          });
        });
      },
      error: (err) => {
        console.error('Błąd pobierania koszyka:', err);
      }
    });
  }


  startPayment(): void {
    console.log('Payment process started!');
  }
}
