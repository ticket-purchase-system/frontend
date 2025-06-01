import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BasketService } from './../basket.service';
import { EventService, EventWithDetails } from '../event.service';
import { OrdersService } from '../order-service/order.service';
import { MockPaymentDialogComponent, PaymentDialogData } from '../mock-payment-dialog/mock-payment-dialog.component';
import { AuthService } from '../auth/auth.service';
import { Order } from '../order-service/order.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private snackBar: MatSnackBar
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
    if (!this.events.length) {
      console.error('[PAYMENT ERROR] Brak eventów w koszyku!');
      return;
    }

    // Prepare payment dialog data
    const paymentData: PaymentDialogData = {
      totalAmount: this.getTotalPrice(),
      items: this.events.map(event => ({
        title: event.event?.title || 'Event',
        price: (event.event?.price || 0) * (event.quantity || 1),
        quantity: event.quantity
      }))
    };

    const dialogRef = this.dialog.open(MockPaymentDialogComponent, {
      width: '600px',
      data: paymentData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.paymentCompleted) {
        this.completeMockPurchase(result);
      }
    });
  }

  private completeMockPurchase(paymentResult: any): void {
    if (!this.events.length) {
      console.error('[ORDER ERROR] Brak eventów w koszyku!');
      return;
    }

    const firstTicketUserId = this.events[0].user;

    const productCreations = this.events.map(event => {
      const payload = {
        price: event.event?.price,
        description: event.event?.title,
        event: event.event?.id
      };

      return this.ordersService.createProduct(payload).toPromise();
    });

    Promise.all(productCreations)
  .then(async (products: any[]) => {
    console.log('[PRODUCTS] Utworzone produkty:', products);

    const orderPayload = {
      id: 0,
      user: this.currentAppUserId,
      date: new Date(),
      price: this.getTotalPrice(),
      rabatCode: '',
      phoneNumber: '123456789',
      email: 'user@example.com',
      city: 'Miasto',
      address: 'Ulica 1',
      review: null,
      products: [] 
    };

    const requestPayload = {
      ...orderPayload,
      date: orderPayload.date.toISOString(), 
    };

    this.ordersService.createOrder(requestPayload as any).subscribe({
      next: (createdOrder: any) => {
        console.log('[ORDER] Stworzono zamówienie:', createdOrder);

        const addProductPromises = products.map((prod, index) => {
          return this.ordersService.addProductToOrder(createdOrder.id, {
            product_id: prod.id,
            quantity: this.events[index].quantity || 1
          }).toPromise();
        });

        Promise.all(addProductPromises)
          .then(() => {
            console.log('[ORDER PRODUCTS] Wszystkie dodane');
            this.clearBasket();
            this.showOrderSuccessMessage(paymentResult);
          })
          .catch(err => console.error('[ORDER PRODUCTS ERROR]', err));
      },
      error: (err: any) => {
        console.error('[ORDER ERROR]', err);
      }
    });
  })
  .catch(err => console.error('[PRODUCT CREATION ERROR]', err));
  }

  private showOrderSuccessMessage(paymentResult: any): void {
    let message = 'Order completed successfully! ';
    
    if (paymentResult.voucherUsed > 0) {
      message += `$${paymentResult.voucherUsed} voucher discount applied. `;
    }
    
    if (paymentResult.loyaltyPointsAwarded > 0) {
      message += `${paymentResult.loyaltyPointsAwarded} loyalty points earned! `;
    }
    
    if (paymentResult.tierAdvanced) {
      message += `Congratulations! You've advanced to ${paymentResult.newTier} tier! `;
    }

    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  // Ręczne usuwanie ticketu z koszyka
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
