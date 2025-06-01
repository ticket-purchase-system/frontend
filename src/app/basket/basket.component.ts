import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BasketService } from './../basket.service';
import { EventService, EventWithDetails } from '../event.service';
import { OrdersService } from '../order-service/order.service';
import { MockPaymentDialogComponent } from '../mock-payment-dialog/mock-payment-dialog.component';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss'],
})
export class BasketComponent implements OnInit {
  events: (EventWithDetails & { quantity: number; user: number; id: number })[] = [];
  currentAppUserId: number = 0;
  orders: any[] = [];

  constructor(
    private eventService: EventService,
    private basketService: BasketService,
    private dialog: MatDialog,
    private ordersService: OrdersService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentAppUserId = user.id;
        console.log('[BASKET] Zalogowany AppUser ID:', this.currentAppUserId);
      }
    });

    this.basketService.getBasket().subscribe({
      next: (items) => {
        this.eventService.getEvents().subscribe(events => {
          this.events = items.map(ticket => {
            const eventDetails = events.find(e => e.event.id === ticket.event);
            return {
              ...ticket,
              event: eventDetails?.event,
              quantity: ticket.quantity || 1,
              user: ticket.user,
              id: ticket.id
            };
          });
        });
      },
      error: (err) => console.error('[BASKET] Błąd pobierania koszyka:', err)
    });
  }

  startPayment(): void {
    const dialogRef = this.dialog.open(MockPaymentDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.completeMockPurchase();
    });
  }

  private completeMockPurchase(): void {
    if (!this.events.length) {
      console.error('[ORDER ERROR] Brak eventów w koszyku!');
      return;
    }

    const firstTicketUserId = this.events[0].user;

    const productCreations = this.events.map(event => {
      const productPayload = {
        price: event.event?.price ?? 0,
        description: event.event?.title ?? 'Brak nazwy',
        event: event.event?.id,
        sector: 'A',
        seat: null
      };


      return this.ordersService.createProduct(productPayload).toPromise();
    });

    Promise.all(productCreations)
      .then(createdProducts => {
        console.log('[PRODUCTS] Utworzone produkty:', createdProducts);

        const orderPayload = {
          id: 0,
          user: firstTicketUserId,
          date: new Date(),
          price: this.getTotalPrice(),
          rabatCode: '',
          phoneNumber: '123456789',
          email: 'user@example.com',
          city: 'Miasto',
          address: 'Ulica 1',
          review: null,
          products: createdProducts.map((p: any) => ({
            id: p.id,
            price: p.price,
            description: p.description
          }))
        };

        this.ordersService.createOrder(orderPayload).subscribe({
          next: (createdOrder) => {
            console.log('[ORDER] Utworzono:', createdOrder);
            this.orders.unshift(createdOrder);
            this.clearBasket();
          },
          error: err => {
            console.error('[ORDER ERROR]', err);
          }
        });
      })
      .catch(err => {
        console.error('[PRODUCT CREATION ERROR]', err);
      });
  }

  // 🔁 Ręczne usuwanie ticketu z koszyka
  removeTicket(ticket: any): void {
    const ticketId = ticket.id;
    this.basketService.removeFromBasket(ticketId).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.id !== ticketId);
        console.log('[BASKET] Usunięto ticket ręcznie:', ticketId);
      },
      error: (err) => {
        console.error('Błąd usuwania ticketu:', err);
      }
    });
  }

  clearBasket(): void {
    this.events.forEach(e => {
      const ticketId = e.id;
      this.basketService.removeFromBasket(ticketId).subscribe({
        next: () => console.log('[BASKET] Usunięto ticket:', ticketId),
        error: err => console.error('[❌ Błąd usuwania]', err)
      });
    });
    this.events = [];
  }

  getTotalPrice(): number {
    return this.events.reduce((sum, e) => sum + ((+e.event?.price || 0) * (e.quantity || 1)), 0);
  }
}
