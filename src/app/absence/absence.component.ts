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
      const rawDate = this.absenceForm.value.date;
      const formattedDate = this.formatDateToISOString(rawDate);
  
      const absenceData = {
        ...this.absenceForm.value,
        date: formattedDate, // Replace the raw date with the formatted date
      };
  
      this.dialogRef.close(absenceData); // Send normalized data back to parent
    }
  }
  
  // Utility to format the date to YYYY-MM-DD (without timezone adjustments)
  private formatDateToISOString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  

  onCancelClick(): void {
    this.dialogRef.close(); // Close dialog without saving
  }
}
