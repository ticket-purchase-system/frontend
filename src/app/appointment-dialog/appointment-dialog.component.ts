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
import { AppointmentService, Absence } from '../appointment.service';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';


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
    MatOptionModule, // Import MatOptionModule
    MatSelectModule, // Import MatSelectModule
  ],
})
export class AppointmentDialogComponent {
  appointmentForm: FormGroup;
  fullHourOptions: string[] = [];
  absences: Absence[];

  
  constructor(
    public dialogRef: MatDialogRef<AppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id: string;
      date: string;
      name_and_surname: string;
      type?: string;
      age?:number;
      gender?:string;
      startTime: string;
      endTime: string;
      additional_info?: string,
      color?: string;
      absences: Absence[];
    },
    private formBuilder: FormBuilder,
    private appointmentService: AppointmentService
  ) {
    this.absences = data.absences;
    this.generateFullHourOptions();

    this.appointmentForm = this.formBuilder.group(
      {
        name_and_surname: [this.data.name_and_surname || '', Validators.required],
        type: [this.data.type || '', Validators.required],
        age: [this.data.age || '', [Validators.required, Validators.min(0), Validators.max(100)]],
        gender: [this.data.gender || '', Validators.required], // Add gender field
        additional_info: [this.data.additional_info || ''], // Add additional_info field (not required)
        date: [this.data.date, Validators.required],
        startTime: [this.data.startTime || '', Validators.required],
        endTime: [this.data.endTime || '', Validators.required],
      },
      { validators: this.timeRangeValidator }
    );
  }

  private generateFullHourOptions(): void {
    this.fullHourOptions = [];
    const startHour = 9; // Start at 9:00
    const endHour = 16; // End at 16:00
  
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        if (hour === endHour && minutes > 0) break; // Exclude 16:30
        const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
        const formattedMinutes = minutes === 0 ? '00' : `${minutes}`;
        this.fullHourOptions.push(`${formattedHour}:${formattedMinutes}`);
      }
    }
  }
  

  private formatAsYYYYMMDD(dateValue: any): string {
    const d = new Date(dateValue);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  onSaveClick(): void {
    if (this.appointmentForm.valid) {
      const rawDateValue = this.appointmentForm.controls['date'].value;
      const dateString = this.formatAsYYYYMMDD(rawDateValue);
  
      const data = {
        name_and_surname: this.appointmentForm.controls['name_and_surname'].value,
        type: this.appointmentForm.controls['type'].value,
        gender: this.appointmentForm.controls['gender'].value,
        age: this.appointmentForm.controls['age'].value,
        date: dateString,
        startTime: this.appointmentForm.controls['startTime'].value,
        endTime: this.appointmentForm.controls['endTime'].value,
        id: this.data.id, // Include ID if it's an edit operation
        additional_info: this.appointmentForm.controls['additional_info'].value,
      };
  
      this.dialogRef.close(data); // Pass the data back to the caller
    }
  }


  // onSaveClick(): void {
  //   if (this.appointmentForm.valid) {
  //     const rawDateValue = this.appointmentForm.controls['date'].value;
  //     const dateString = this.formatAsYYYYMMDD(rawDateValue);
  
  //     const newAppointment = {
  //       title: this.appointmentForm.controls['title'].value,
  //       date: dateString,
  //       startTime: this.appointmentForm.controls['startTime'].value,
  //       endTime: this.appointmentForm.controls['endTime'].value,
  //       id: this.data.id,
  //     };
  
  //     if (this.isOverlappingAbsence(newAppointment)) {
  //       alert('The appointment overlaps with an existing absence. Please choose a different time.');
  //       return;
  //     }
  
  //     this.dialogRef.close(newAppointment); // Save the appointment
  //   }
  // }
  
  

  onEditClick(): void {
    if (this.appointmentForm.valid) {
      const rawDateValue = this.appointmentForm.controls['date'].value;
      const dateString = this.formatAsYYYYMMDD(rawDateValue);
  
      const updatedAppointment = {
        name_and_surname: this.appointmentForm.controls['name_and_surname'].value,
        type: this.appointmentForm.controls['type'].value,
        gender: this.appointmentForm.controls['gender'].value,
        age: this.appointmentForm.controls['age'].value,
        date: dateString,
        startTime: this.appointmentForm.controls['startTime'].value,
        endTime: this.appointmentForm.controls['endTime'].value,
        id: this.data.id, // Include ID for the edit operation
        additional_info: this.appointmentForm.controls['additional_info'].value,
      };
  
      // Call the service to update the appointment
      this.appointmentService.updateAppointment(updatedAppointment).subscribe({
        next: (response) => {
          console.log('Appointment updated successfully:', response);
          this.dialogRef.close(response); // Close the dialog and pass the updated appointment
        },
        error: (err) => {
          console.error('Error updating appointment:', err);
        },
      });
    }
  }
  

  onDeleteClick(): void {
    this.appointmentService.deleteAppointment(this.data.id).subscribe({
      next: () => {
        this.dialogRef.close({ remove: true, id: this.data.id });
      },
      error: (err) => {
        console.error('Error deleting appointment:', err);
      },
    });
  }

  // private isOverlappingAbsence(appointment: { date: string; startTime: string; endTime: string }): boolean {
  //   if (!appointment.date || !appointment.startTime || !appointment.endTime) {
  //     console.log('Invalid appointment data:', appointment);
  //     return false; // Invalid appointment data
  //   }
  
  //   console.log('Appointment:', appointment);
  //   console.log('Absences:', this.absences);
  
  //   return this.absences.some((absence) => {
  //     const absenceDate = new Date(absence.date).toISOString().split('T')[0];
  //     console.log('Checking absence:', absence);
  //     console.log('Formatted absence date:', absenceDate);
  
  //     if (appointment.date === absenceDate) {
  //       const [appointmentStartHours, appointmentStartMinutes] = appointment.startTime.split(':').map(Number);
  //       const [appointmentEndHours, appointmentEndMinutes] = appointment.endTime.split(':').map(Number);
  //       const [absenceStartHours, absenceStartMinutes] = absence.startTime.split(':').map(Number);
  //       const [absenceEndHours, absenceEndMinutes] = absence.endTime.split(':').map(Number);
  
  //       const appointmentStart = appointmentStartHours * 60 + appointmentStartMinutes;
  //       const appointmentEnd = appointmentEndHours * 60 + appointmentEndMinutes;
  //       const absenceStart = absenceStartHours * 60 + absenceStartMinutes;
  //       const absenceEnd = absenceEndHours * 60 + absenceEndMinutes;
  
  //       console.log('Time comparison:', {
  //         appointmentStart,
  //         appointmentEnd,
  //         absenceStart,
  //         absenceEnd,
  //       });
  
  //       return (
  //         (appointmentStart >= absenceStart && appointmentStart < absenceEnd) || // Appointment starts during absence
  //         (appointmentEnd > absenceStart && appointmentEnd <= absenceEnd) || // Appointment ends during absence
  //         (appointmentStart <= absenceStart && appointmentEnd >= absenceEnd) // Appointment fully spans the absence
  //       );
  //     }
  //     return false;
  //   });
  // }
  
  
  

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

      if (startDate >= endDate) {
        return { timeRangeInvalid: true };
      }
    }
    return null;
  };
}
