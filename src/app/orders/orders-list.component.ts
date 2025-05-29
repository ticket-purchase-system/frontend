import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Order, OrdersService } from '../order-service/order.service';
import { AuthService, User } from '../auth/auth.service';
import { SendTicketDialogComponent } from './send-ticket-dialog/send-ticket-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { httpHelper } from '../utils/HttpHelper';
import { MatSnackBar } from '@angular/material/snack-bar';
import {Review, ReviewService} from "../review-service.service";
import {ReviewDialogComponent} from "../review-dialog/review-dialog.component";
import { RequestRefundDialogComponent } from './request-refund-dialog/request-refund-dialog.component';
import { ReportIssueDialogComponent } from './report-issue-dialog/report-issue-dialog.component';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
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
    private reviewService: ReviewService,
    private dialog: MatDialog,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
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
    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      data: {
        order: order,
        existingReview: order.review
      },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: Review | undefined) => {
      if (result) {
        if (order.review) {
          this.reviewService.updateReview(order.id, result).subscribe({
            next: (updatedReview) => {
              order.review = updatedReview;
              this.snackBar.open('Review updated successfully!', 'Close', { duration: 3000 });
            },
            error: (err) => {
              console.error('Error updating review:', err);
              this.snackBar.open('Failed to update review. Please try again.', 'Close', { duration: 3000 });
            }
          });
        } else {
          this.reviewService.addReview(order.id, result).subscribe({
            next: (newReview) => {
              order.review = newReview;
              this.snackBar.open('Review submitted successfully!', 'Close', { duration: 3000 });
            },
            error: (err) => {
              console.error('Error submitting review:', err);
              this.snackBar.open('Failed to submit review. Please try again.', 'Close', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  deleteReview(order: Order): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteReview(order.id).subscribe({
        next: () => {
          order.review = null;
          this.snackBar.open('Review deleted successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error deleting review:', err);
          this.snackBar.open('Failed to delete review. Please try again.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  reportIssue(order: Order): void {
    const dialogRef = this.dialog.open(ReportIssueDialogComponent, {
      data: { description: '' }
    });
    dialogRef.afterClosed().subscribe(description => {
      if (description) {
        const headers = httpHelper.getAuthHeaders();
        const url = `${environment.apiUrl}/orders/${order.id}/report-issue/`;
        this.http.post(url, {opis: description }, { headers }).subscribe({
          next: () => this.snackBar.open('Zgłoszenie problemu zostało wysłane.', 'Zamknij', { duration: 5000 }),
          error: (err) => {
            console.error('Error reporting issue:', err);
            this.snackBar.open('Wystąpił błąd podczas zgłaszania problemu.', 'Zamknij', { duration: 5000 });
          }
        });
      }
    });
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
            this.snackBar.open(`Tickets for order #${order.id} has been sent to: ${result}`, 'Close', { duration: 3000 });
          },
          error: (error: { status: number; error: { error: any; }; }) => {
            console.error('Error sending email:', error);
            this.snackBar.open('Failed to send email. Please try again.', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

requestRefund(order: Order): void {
    const dialogRef = this.dialog.open(RequestRefundDialogComponent, {
      data: { reason: '' }
    });
    dialogRef.afterClosed().subscribe(reason => {
      if (reason) {
        const headers = httpHelper.getAuthHeaders();
        const url = `${environment.apiUrl}/orders/${order.id}/refund/`;
        this.http.post(url, { reason }, { headers }).subscribe({
          next: () => this.snackBar.open('Wniosek o zwrot został wysłany.', 'Zamknij', { duration: 5000 }),
          error: (err) => {
            console.error('Error requesting refund:', err);
            this.snackBar.open('Wystąpił błąd podczas składania wniosku o zwrot.', 'Zamknij', { duration: 5000 });
          }
        });
      }
    });
    
  }

downloadTicketPdf(order: Order): void {
  const url = `${environment.apiUrl}/orders/${order.id}/download-pdf/`;
  const headers = httpHelper.getAuthHeaders();

  

  this.http.get(url, {
    headers,
    responseType: 'blob'
  }).subscribe({
    next: (blob) => {
      const file = new Blob([blob], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);

      const a = document.createElement('a');
      a.href = fileURL;
      a.download = `zamowienie_${order.id}.pdf`;
      a.click();

      URL.revokeObjectURL(fileURL);
      this.snackBar.open('PDF został pobrany.', 'Zamknij', { duration: 3000 });
    },
    error: (err) => {
      console.error('Błąd pobierania PDF-a:', err);
      this.snackBar.open('Nie udało się pobrać PDF-a.', 'Zamknij', { duration: 3000 });
    }
  });
}

  getStarRating(review: Review | null): string {
    if (!review) return '';

    const stars = parseInt(review.numberOfStars);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  }
}
