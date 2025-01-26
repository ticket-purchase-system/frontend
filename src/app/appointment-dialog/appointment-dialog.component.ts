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
import { AppointmentService, Absence, Appointment } from '../appointment.service';
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
      appointments: Appointment[];
    },
    private formBuilder: FormBuilder,
    private appointmentService: AppointmentService
  ) {

    console.log('Received absences:', this.data.absences);

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
      { validators: [this.timeRangeValidator,
                    this.absenceValidator(this.data.absences || []),
                    this.eventOverlapValidator(this.data.appointments || [])
      ]
       }
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

  eventOverlapValidator(existingEvents: Appointment[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // Skip overlap validation during edit operations
      if (this.data.id) {
        return null;
      }
  
      const date = this.formatAsYYYYMMDD(control.get('date')?.value);
      const startTime = control.get('startTime')?.value;
      const endTime = control.get('endTime')?.value;
  
      if (date && startTime && endTime) {
        const [startHours, startMinutes] = startTime.split(':');
        const [endHours, endMinutes] = endTime.split(':');
  
        const newEventStart = new Date(`${date}T${startHours}:${startMinutes}`);
        const newEventEnd = new Date(`${date}T${endHours}:${endMinutes}`);
  
        const overlap = existingEvents.some(event => {
          // Skip the current appointment during edit operations
          if (event.id === this.data.id) {
            return false;
          }
  
          const eventDate = this.formatAsYYYYMMDD(event.date);
          const [eventStartHours, eventStartMinutes] = event.startTime.split(':');
          const [eventEndHours, eventEndMinutes] = event.endTime.split(':');
  
          const eventStart = new Date(`${eventDate}T${eventStartHours}:${eventStartMinutes}`);
          const eventEnd = new Date(`${eventDate}T${eventEndHours}:${eventEndMinutes}`);
  
          return (
            date === eventDate &&
            (
              (newEventStart >= eventStart && newEventStart < eventEnd) ||
              (newEventEnd > eventStart && newEventEnd <= eventEnd) ||
              (newEventStart <= eventStart && newEventEnd >= eventEnd)
            )
          );
        });
  
        if (overlap) {
          return { overlappingEvent: true };
        }
      }
  
      return null;
    };
  }
  

  


  absenceValidator(absences: Absence[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const date = this.formatAsYYYYMMDD(control.get('date')?.value);
      const startTime = control.get('startTime')?.value;
      const endTime = control.get('endTime')?.value;
  
      if (date && startTime && endTime) {
        const [startHours, startMinutes] = startTime.split(':');
        const [endHours, endMinutes] = endTime.split(':');
  
        const appointmentStart = new Date(`${date}T${startHours}:${startMinutes}`);
        const appointmentEnd = new Date(`${date}T${endHours}:${endMinutes}`);
  
        const overlap = absences.some(absence => {
          const absenceStart = new Date(`${absence.date}T${absence.startTime}`);
          const absenceEnd = new Date(`${absence.date}T${absence.endTime}`);
  
          return (
            (appointmentStart >= absenceStart && appointmentStart < absenceEnd) ||
            (appointmentEnd > absenceStart && appointmentEnd <= absenceEnd) ||
            (appointmentStart <= absenceStart && appointmentEnd >= absenceEnd)
          );
        });
  
        if (overlap) {
          return { overlappingAbsence: true };
        }
      }
  
      return null;
    };
  }
  

  onNoClick(): void {
    this.dialogRef.close();
  }


  onSaveClick(): void {
    if (this.appointmentForm.valid) {
      const rawDateValue = this.appointmentForm.controls['date'].value;
      const dateString = this.formatAsYYYYMMDD(rawDateValue);

      const type = this.appointmentForm.controls['type'].value;
      const color = type === 'first consultation' ? 'rgba(186, 162, 255, 0.61)': 'rgba(129, 196, 250, 0.61)';
  
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
        color: color,
      };
  
      this.dialogRef.close(data); // Pass the data back to the caller
    }
  }

  

  onEditClick(): void {
    if (this.appointmentForm.valid) {
      const rawDateValue = this.appointmentForm.controls['date'].value;
      const dateString = this.formatAsYYYYMMDD(rawDateValue);

      const type = this.appointmentForm.controls['type'].value;
      const color = type === 'first consultation' ? 'rgba(186, 162, 255, 0.61)': 'rgba(129, 196, 250, 0.61)';
  
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
        color: color,
      };
  
      this.appointmentService.updateAppointment(updatedAppointment).subscribe({
        next: (response) => {
          console.log('Appointment updated successfully:', response);
          this.dialogRef.close(response); 
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
