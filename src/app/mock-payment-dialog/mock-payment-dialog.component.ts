import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-mock-payment-dialog',
  templateUrl: './mock-payment-dialog.component.html',
  styleUrls: ['./mock-payment-dialog.component.scss']
})
export class MockPaymentDialogComponent {
  constructor(public dialogRef: MatDialogRef<MockPaymentDialogComponent>) {}

  close(): void {
    this.dialogRef.close();
  }
}
