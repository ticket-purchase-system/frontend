import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Voucher } from '../../../voucher.service';

@Component({
  selector: 'app-send-voucher-dialog',
  templateUrl: './send-voucher-dialog.component.html',
  styleUrls: ['./send-voucher-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class SendVoucherDialogComponent {
  sendForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SendVoucherDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { voucher: Voucher }
  ) {
    this.sendForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSend(): void {
    if (this.sendForm.invalid) {
      return;
    }
    
    this.dialogRef.close(this.sendForm.value);
  }
} 