import {Component, Inject, OnInit} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ReportIssueDialogComponent} from "../report-issue-dialog/report-issue-dialog.component";
import {FavoriteService} from "../favorite-service.service";
import {Review, ReviewService} from "../review-service.service";

@Component({
  selector: 'app-ticket-purchase-dialog',
  templateUrl: './ticket-purchase-dialog.component.html',
  styleUrls: ['./ticket-purchase-dialog.component.scss'] // Add this if you need styling
})
export class TicketPurchaseDialogComponent implements OnInit {
  ticketForm: FormGroup;
  availableSeats: string[] = ['A1', 'A2', 'B1', 'B2'];
  eventId: number;
  isFavorite: boolean = false;
  reviews: Review[] | null = null;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<TicketPurchaseDialogComponent>,
    private favoriteService: FavoriteService,
    private reviewService: ReviewService,
    @Inject(MAT_DIALOG_DATA) public eventData: any
  ) {
    this.ticketForm = this.fb.group({
      seat: [''],
      quantity: [1],
      is_group: [false]
    });

    // Make sure we properly extract the event ID
    this.eventId = this.eventData?.event?.id;
    this.isFavorite = this.eventData?.isFavorite;
  }

  ngOnInit(): void {
    if (this.eventId) {
      // Only fetch reviews if we have a valid eventId
      this.reviewService.getProductReviews(this.eventId).subscribe({
        next: (reviews) => {
          console.log('Received reviews:', reviews);
          this.reviews = reviews || []; // Ensure reviews is always an array
        },
        error: (err) => {
          console.error('Error loading reviews:', err);
          this.reviews = []; // Set empty array on error
        }
      });
    } else {
      console.warn('No event ID available, cannot load reviews');
    }
  }

  onPurchase() {
    const formValue = this.ticketForm.value;

    if (!this.eventId) {
      console.error('❌ Missing event ID!');
      return;
    }

    console.log('✅ Sending data to cart:', {
      event: this.eventId,
      ...formValue
    });

    this.dialogRef.close({
      event: this.eventId,
      seat: formValue.seat,
      quantity: formValue.quantity,
      is_group: formValue.is_group
    });
    console.log('💳 Ktoś kliknął "Kup bilet"');
    console.trace();
  }

  onAddFavorite(): void {
    this.isFavorite = true;
    this.favoriteService.markFavorite(this.eventData.user, this.eventId).subscribe({
      next: () => {
        console.log('Marked favorite');
        alert('Added event to favorites.')
      },
      error: (err) => {
        console.error('Error marking favorite:', err);
        this.isFavorite = false;
      }
    });
  }

  onRemoveFavorite(): void {
    this.isFavorite = false;
    this.favoriteService.removeFavorite(this.eventData.user, this.eventId).subscribe({
      next: () => {
        console.log('Unmarked favorite');
        alert('Removed event from favorites.')
      },
      error: (err) => {
        console.error('Error removing favorite:', err);
        this.isFavorite = true; // Revert UI state on error
      }
    });
  }

  openReportDialog(event: any, eventClick: MouseEvent): void {
    eventClick.stopPropagation(); // prevent clicking the event to edit
    this.dialog.open(ReportIssueDialogComponent, {
      data: { event },
      width: '400px'
    });
  }
}
