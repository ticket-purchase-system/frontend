import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-request-refund-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule],
  template: `
  <div class="basket-container">
    <h2 class="basket-title">Request a Refund</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()" autocomplete="off">
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>Reason for Refund</mat-label>
        <textarea matInput formControlName="reason" required></textarea>
      </mat-form-field>

      <p class="note-required">* - fields marked with an asterisk are required</p>

      <div class="dialog-actions">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-flat-button color="primary" type="submit">Submit</button>
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

    .note-required {
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 0.6);
    margin-top: -10px;
    margin-bottom: 10px;
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
export class RequestRefundDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RequestRefundDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reason: string }
  ) {
    this.form = this.fb.group({ reason: [data.reason,Validators.required] });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.reason);
    }
  }
}
