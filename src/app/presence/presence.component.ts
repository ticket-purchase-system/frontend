import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-presence',
  templateUrl: './presence.component.html',
  styleUrl: './presence.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule
  ],
})

export class PresenceComponent {


  presenceForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<PresenceComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any, // Data from the parent component, if any
    private formBuilder: FormBuilder
  ) {
    this.presenceForm = this.formBuilder.group({
      date: [null, Validators.required], // Presence date
      startTime: ['', Validators.required], // Start time
      endTime: ['', Validators.required], // End time
      repeat: ['none'], // Repeat options: none, daily, weekly
      until: [null], // End date for repetition
    }, { validators: this.timeRangeValidator });
    
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

  private generateRepeatedDates(startDate: Date, repeat: string, until: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
  
    while (currentDate <= until) {
      dates.push(new Date(currentDate)); // Add the current date to the list
  
      if (repeat === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1); // Add one day
      } else if (repeat === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7); // Add one week
      } else {
        break; // If no repeat, stop
      }
    }
  
    return dates;
  }

  onSaveClick(): void {
  if (this.presenceForm.valid) {
    const rawStartDate = this.presenceForm.value.date;
    const formattedStartDate = this.formatDateToISOString(rawStartDate);
    const repeat = this.presenceForm.value.repeat;
    const untilDate = this.presenceForm.value.until
      ? new Date(this.presenceForm.value.until)
      : null;

    // Generate repeated dates
    const repeatedDates = repeat !== 'none' && untilDate
      ? this.generateRepeatedDates(new Date(formattedStartDate), repeat, untilDate)
      : [new Date(formattedStartDate)];

    // Create presence records for each date
    const presences = repeatedDates.map(date => ({
      date: this.formatDateToISOString(date), // Format date as YYYY-MM-DD
      startTime: this.presenceForm.value.startTime,
      endTime: this.presenceForm.value.endTime,
    }));

    this.dialogRef.close(presences); // Send the list of presences back to the parent
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
