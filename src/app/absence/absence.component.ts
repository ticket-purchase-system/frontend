import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-absence',
  templateUrl: './absence.component.html',
  styleUrls: ['./absence.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    ReactiveFormsModule,
  ],
})
export class AbsenceComponent {
  absenceForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AbsenceComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any, // Data from the parent component, if any
    private formBuilder: FormBuilder
  ) {
    this.absenceForm = this.formBuilder.group({
      date: [null, Validators.required], // Absence date
      startTime: ['', Validators.required], // Start time
      endTime: ['', Validators.required], // End time
    }, { validators: this.timeRangeValidator }); // Add time range validation
  }

  // Validation: Ensure end time is after start time
  timeRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const startTime = group.get('startTime')?.value;
    const endTime = group.get('endTime')?.value;

    if (startTime && endTime && startTime >= endTime) {
      return { timeRangeInvalid: true }; // Invalid if start >= end
    }
    return null;
  }

  onSaveClick(): void {
    if (this.absenceForm.valid) {
      this.dialogRef.close(this.absenceForm.value); // Send form data back to parent
    }
  }

  onCancelClick(): void {
    this.dialogRef.close(); // Close dialog without saving
  }
}
