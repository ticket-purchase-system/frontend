import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../appointment.service';


@Component({
  selector: 'app-appointment-dialog',
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.scss'],
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
export class AppointmentDialogComponent {
  appointmentForm: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<AppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id: string;
      date: string;
      title: string;
      startTime: string;
      endTime: string;
      color?: string;
    },
    private formBuilder: FormBuilder,
    private appointmentService: AppointmentService
  ) {
    this.appointmentForm = this.formBuilder.group(
      {
        title: [this.data.title || '', Validators.required],
        date: [this.data.date, Validators.required],
        startTime: [this.data.startTime || '', Validators.required],
        endTime: [this.data.startTime || '', Validators.required],
      },
      { validators: this.timeRangeValidator }
    );
  }

  private formatAsYYYYMMDD(dateValue: any): string { 
    const d = new Date(dateValue);
  
    // Extract the local date components
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(d.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`; // Return in "YYYY-MM-DD" format
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if (this.appointmentForm.valid) {
      const rawDateValue = this.appointmentForm.controls['date'].value; // Likely a Date object
      const dateString = this.formatAsYYYYMMDD(rawDateValue);
  
      const data = {
        title: this.appointmentForm.controls['title'].value,
        date: dateString,  // Store final string, not the raw Date
        startTime: this.appointmentForm.controls['startTime'].value,
        endTime: this.appointmentForm.controls['endTime'].value,
        id: this.data.id,
      };
      this.dialogRef.close(data);
    }
  }
  


  onEditClick(): void {
    if (this.appointmentForm.valid) {
      const rawDateValue = this.appointmentForm.controls['date'].value;
      const dateString = this.formatAsYYYYMMDD(rawDateValue);
  
      // Prepare the updated appointment data
      const updatedAppointment = {
        title: this.appointmentForm.controls['title'].value,
        date: dateString, // Store "YYYY-MM-DD" instead of full ISO string
        startTime: this.appointmentForm.controls['startTime'].value,
        endTime: this.appointmentForm.controls['endTime'].value,
        id: this.data.id, // Make sure the ID is passed for the update operation
      };
  
      // Call the service method to update the appointment
      this.appointmentService.updateAppointment(updatedAppointment).subscribe({
        next: (response) => {
          console.log('Appointment updated successfully:', response);
          this.dialogRef.close(response); // Close the dialog and pass updated data back
        },
        error: (err) => {
          console.error('Error updating appointment:', err);
          // Optionally show an error message to the user
        },
      });
    }
  }
  
  

  onDeleteClick(): void {
    this.appointmentService.deleteAppointment(this.data.id).subscribe({
      next: () => {
        // Zamknięcie dialogu po pomyślnym usunięciu
        this.dialogRef.close({ remove: true, id: this.data.id });
      },
      error: (err) => {
        console.error('Error deleting appointment:', err);
      },
    });
  }
  

  timeRangeValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const startTime = control.get('startTime')?.value;
    const endTime = control.get('endTime')?.value;
    if (startTime && endTime) {
      const [startHours, startMinutes] = startTime.split(':');
      const [endHours, endMinutes] = endTime.split(':');

      const startDate = new Date();
      startDate.setHours(startHours);
      startDate.setMinutes(startMinutes);

      const endDate = new Date();
      endDate.setHours(endHours);
      endDate.setMinutes(endMinutes);

      if (startDate > endDate) {
        return { timeRangeInvalid: true };
      }
    }
    return null;
  };
}


