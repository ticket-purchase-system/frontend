import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-ticket-purchase-dialog',
  templateUrl: './ticket-purchase-dialog.component.html'
})
export class TicketPurchaseDialogComponent {
  ticketForm: FormGroup;
  availableSeats: string[] = ['A1', 'A2', 'B1', 'B2'];
  eventId: number;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TicketPurchaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public eventData: any
  ) {
    this.ticketForm = this.fb.group({
      seat: [''],
      quantity: [1],
      is_group: [false]
    });
    this.eventId = this.eventData?.id;
  }

  onCancel() {
    this.dialogRef.close();
  }

  onPurchase() {
    const formValue = this.ticketForm.value;

    if (!this.eventData?.id) {
      console.error('❌ Brakuje ID wydarzenia!');
      return;
    }
    console.log('✅ Wysyłam dane do koszyka:', {
      event: this.eventData?.id,
      ...formValue
    });
    
    this.dialogRef.close({
      event: this.eventData.id,
      seat: formValue.seat,
      quantity: formValue.quantity,
      is_group: formValue.is_group
    });
  }
}
