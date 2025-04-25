import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Order, OrdersService } from '../order-service/order.service';
import { AuthService, User } from '../auth/auth.service';
import { SendTicketDialogComponent } from './send-ticket-dialog/send-ticket-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { httpHelper } from '../utils/HttpHelper';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  standalone: true,
  imports:[CommonModule, MatListModule, MatIconModule, MatButtonModule,  CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    ],
  styleUrls: ['./orders-list.component.scss'],
})
export class OrdersListComponent implements OnInit {
  currentUser: User | null = null;
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  loading = true;
  error = '';

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService,
    private dialog: MatDialog,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
      
      if (this.currentUser?.id) {
        this.ordersService.getUserOrders(this.currentUser.id).subscribe({
          next: (data) => {
            this.orders = data;
            this.loading = false;
          },
          error: (err) => {
            console.error('Błąd ładowania zamówień', err);
            this.error = 'Wystąpił błąd podczas ładowania historii zamówień.';
            this.loading = false;
          }
        });
      } else {
        this.loading = false;
        this.error = 'Nie udało się załadować danych użytkownika.';
      }
    });
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
  }

  clearSelection(): void {
    this.selectedOrder = null;
  }

  submitReview(order: Order): void {
    alert(`Wystawianie opinii do zamówienia #${order.id}`);
  }

  reportIssue(order: Order): void {
    alert(`Zgłaszanie nieprawidłowości dla zamówienia #${order.id}`);
  }

  sendTicketByEmail(order: Order): void {  
    const dialogRef = this.dialog.open(SendTicketDialogComponent, {
      data: { email: order.email },
    });
  
    dialogRef.afterClosed().subscribe((result: string | undefined) => {
      if (result) {
        const token = localStorage.getItem('access_token');
        if (!token) {
          return;
        }
  
        const url = `${environment.apiUrl}/orders/${order.id}/send-email/`;
  
        const headers = httpHelper.getAuthHeaders();
  
        this.http.post(url, { email: result }, { headers }).subscribe({
          next: () => {
            alert(`Tickets for order #${order.id} has been sent to: ${result}`);
          },
          error: (error: { status: number; error: { error: any; }; }) => {
            console.error('Error sending email:', error);
          }
        });
      }
    });
  }

  requestRefund(order: Order): void {
    alert(`Wniosek o zwrot pieniędzy dla zamówienia #${order.id} został złożony.`);
  }

  downloadTicketPdf(order: Order): void {
    alert(`Bilet z opisem dla zamówienia #${order.id} został pobrany.`);
  }
}
