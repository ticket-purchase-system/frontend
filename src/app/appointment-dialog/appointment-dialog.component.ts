import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
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
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { EventService } from '../event.service';
import { ArtistService } from '../artist.service';

export interface Event {
  id?: string;
  title: string;
  type: string;
  date: string;
  start_hour?: string;
  end_hour?: string;
  place?: string;
  price: number;
  seats_no?: number;
  description?: string;
  created_by: number;
  created_at?: string;
  artists?: number[];
}

export interface Artist {
  id: number;
  name: string;
  genre?: string;
  bio?: string;
}

@Component({
  selector: 'app-event-dialog',
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
    MatOptionModule,
    MatSelectModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
  ],
})
export class EventDialogComponent implements OnInit {
  eventForm: FormGroup;
  timeOptions: string[] = [];
  artists: Artist[] = [];

  constructor(
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id?: string;
      title: string;
      type: string;
      date: string;
      start_hour?: string;
      end_hour?: string;
      place?: string;
      price: number;
      seats_no?: number;
      description?: string;
      created_by: number;
      events: Event[];
      artists?: number[];
    },
    private formBuilder: FormBuilder,
    private eventService: EventService,
    private artistService: ArtistService
  ) {
    this.generateTimeOptions();

    this.eventForm = this.formBuilder.group(
      {
        title: [this.data.title || '', Validators.required],
        type: [this.data.type || 'CONCERT', Validators.required],
        artists: [this.data.artists || []],
        seats_no: [this.data.seats_no || ''],
        place: [this.data.place || ''],
        price: [this.data.price || '', [Validators.required, Validators.min(0)]],
        description: [this.data.description || ''],
        date: [this.data.date ? new Date(this.data.date) : '', Validators.required],
        start_hour: [this.data.start_hour || ''],
        end_hour: [this.data.end_hour || ''],
      },
      {
        validators: [
          this.timeRangeValidator,
          this.eventOverlapValidator(this.data.events || [])
        ]
      }
    );
  }

  ngOnInit() {
    this.loadArtists();
  }

  loadArtists() {
    this.artistService.getArtists().subscribe({
      next: (artists) => {
        this.artists = artists;
      },
      error: (error) => {
        console.error('Failed to load artists', error);
      }
    });
  }

  private generateTimeOptions(): void {
    this.timeOptions = [];
    // Generate times from 00:00 to 23:30 in 30-minute increments
    for (let hour = 0; hour < 24; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
        const formattedMinutes = minutes === 0 ? '00' : `${minutes}`;
        this.timeOptions.push(`${formattedHour}:${formattedMinutes}`);
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

  eventOverlapValidator(existingEvents: Event[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // Skip overlap validation during edit operations
      if (this.data.id) {
        return null;
      }

      const date = this.formatAsYYYYMMDD(control.get('date')?.value);
      const startTime = control.get('start_hour')?.value;
      const endTime = control.get('end_hour')?.value;

      if (date && startTime && endTime) {
        const [startHours, startMinutes] = startTime.split(':');
        const [endHours, endMinutes] = endTime.split(':');

        const newEventStart = new Date(`${date}T${startHours}:${startMinutes}`);
        const newEventEnd = new Date(`${date}T${endHours}:${endMinutes}`);

        const overlap = existingEvents.some(event => {
          if (event.id === this.data.id) {
            return false;
          }

          const eventDate = this.formatAsYYYYMMDD(event.date);
          if (!event.start_hour || !event.end_hour) {
            return false;
          }

          const [eventStartHours, eventStartMinutes] = event.start_hour.split(':');
          const [eventEndHours, eventEndMinutes] = event.end_hour.split(':');

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

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    if (this.eventForm.valid) {
      const rawDateValue = this.eventForm.controls['date'].value;
      const dateString = this.formatAsYYYYMMDD(rawDateValue);

      const eventData = {
        title: this.eventForm.controls['title'].value,
        type: this.eventForm.controls['type'].value,
        date: dateString,
        start_hour: this.eventForm.controls['start_hour'].value,
        end_hour: this.eventForm.controls['end_hour'].value,
        place: this.eventForm.controls['place'].value,
        price: this.eventForm.controls['price'].value,
        seats_no: this.eventForm.controls['seats_no'].value,
        description: this.eventForm.controls['description'].value,
        created_by: this.data.created_by, // User ID
        artists: this.eventForm.controls['artists'].value
      };

      this.dialogRef.close(eventData);
    }
  }

  onEditClick(): void {
    if (this.eventForm.valid) {
      const rawDateValue = this.eventForm.controls['date'].value;
      const dateString = this.formatAsYYYYMMDD(rawDateValue);

      const updatedEvent = {
        id: this.data.id,
        title: this.eventForm.controls['title'].value,
        type: this.eventForm.controls['type'].value,
        date: dateString,
        start_hour: this.eventForm.controls['start_hour'].value,
        end_hour: this.eventForm.controls['end_hour'].value,
        place: this.eventForm.controls['place'].value,
        price: this.eventForm.controls['price'].value,
        seats_no: this.eventForm.controls['seats_no'].value,
        description: this.eventForm.controls['description'].value,
        created_by: this.data.created_by,
        artists: this.eventForm.controls['artists'].value
      };

      this.eventService.updateEvent(updatedEvent).subscribe({
        next: (response) => {
          console.log('Event updated successfully:', response);
          this.dialogRef.close(response);
        },
        error: (err) => {
          console.error('Error updating event:', err);
        },
      });
    }
  }

  onDeleteClick(): void {
    if (this.data.id) {
      this.eventService.deleteEvent(this.data.id).subscribe({
        next: () => {
          this.dialogRef.close({ remove: true, id: this.data.id });
        },
        error: (err) => {
          console.error('Error deleting event:', err);
        },
      });
    }
  }

  timeRangeValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const startTime = control.get('start_hour')?.value;
    const endTime = control.get('end_hour')?.value;

    if (startTime && endTime) {
      const [startHours, startMinutes] = startTime.split(':');
      const [endHours, endMinutes] = endTime.split(':');

      const startDate = new Date();
      startDate.setHours(parseInt(startHours));
      startDate.setMinutes(parseInt(startMinutes));

      const endDate = new Date();
      endDate.setHours(parseInt(endHours));
      endDate.setMinutes(parseInt(endMinutes));

      if (startDate >= endDate) {
        return { timeRangeInvalid: true };
      }
    }
    return null;
  };
}
