import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ReportIssueDialogComponent} from "../report-issue-dialog/report-issue-dialog.component";
import {FavoriteService} from "../favorite-service.service";

@Component({
  selector: 'app-ticket-purchase-dialog',
  templateUrl: './ticket-purchase-dialog.component.html'
})
export class TicketPurchaseDialogComponent {
  ticketForm: FormGroup;
  availableSeats: string[] = ['A1', 'A2', 'B1', 'B2'];
  eventId: number;
  isFavorite: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<TicketPurchaseDialogComponent>,
    private favoriteService: FavoriteService,
    @Inject(MAT_DIALOG_DATA) public eventData: any
  ) {
    this.ticketForm = this.fb.group({
      seat: [''],
      quantity: [1],
      is_group: [false]
    });
    this.eventId = this.eventData?.event.id;
    this.isFavorite = this.eventData?.isFavorite;
  }

  onPurchase() {
    const formValue = this.ticketForm.value;

    if (!this.eventData?.event.id) {
      console.error('❌ Brakuje ID wydarzenia!');
      return;
    }
    console.log('✅ Wysyłam dane do koszyka:', {
      event: this.eventData?.event.id,
      ...formValue
    });

    this.dialogRef.close({
      event: this.eventData?.event.id,
      seat: formValue.seat,
      quantity: formValue.quantity,
      is_group: formValue.is_group
    });
  }

  onAddFavorite = (): void => {
    this.isFavorite = true;
    this.favoriteService.markFavorite(this.eventData.user, this.eventData.event.id).subscribe({
      next: () => {
        console.log('Marked favorite')
      }
    })
  }

  onRemoveFavorite = (): void => {
    this.isFavorite = false;
    this.favoriteService.removeFavorite(this.eventData.user, this.eventData.event.id).subscribe({
      next: () => {
        console.log('Unmarked favorite')
      }
    })
  }

  openReportDialog(event: any, eventClick: MouseEvent): void {
    eventClick.stopPropagation(); // prevent clicking the event to edit
    this.dialog.open(ReportIssueDialogComponent, {
      data: { event },
      width: '400px'
    });
  }
}
