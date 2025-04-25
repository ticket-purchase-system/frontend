import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-send-ticket-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule],
  template: `
  <div class="basket-container">
    <h2 class="basket-title">Send Ticket by Email</h2>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" autocomplete="off">
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>Email Address</mat-label>
        <input matInput formControlName="email" required />
      </mat-form-field>

      <div class="dialog-actions">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-flat-button color="primary" type="submit">Send</button>
      </div>
    </form>
  </div>
`,
styles: [`
  .basket-container {
    margin: 20px auto;
    max-width: 500px;
    padding: 0 15px;
    box-sizing: border-box;
  }

  .basket-title {
    text-align: center;
    font-size: 1.6rem;
    margin-bottom: 20px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 8px;
  }

  .w-full {
    width: 100%;
  }

  .dialog-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  button {
    white-space: nowrap;
  }
`]

})
export class SendTicketDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SendTicketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string }
  ) {
    this.form = this.fb.group({
      email: [data.email]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.email);
    }
  }
}
