import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import { BasketComponent } from '../basket/basket.component'
import { AppointmentService, Appointment, Absence, Presence} from '../appointment.service'; 
import { AbsenceComponent } from '../absence/absence.component';
import { AuthService, User } from '../auth/auth.service';
import { PresenceComponent } from '../presence/presence.component';
import { Router } from '@angular/router';

export enum CalendarView {
  Month = 'month',
  Week = 'week',
  Day = 'day',
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  currentUser: User | null = null;
  viewDate: Date = new Date();
  selectedDate: Date | null = null;
  selectedStartTime: string | undefined;
  weekDays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  monthDays: Date[] = [];
  appointments: Appointment[] = [];
  currentView: CalendarView = CalendarView.Week;
  timeSlots: string[] = [];
  now: Date = new Date();
  weeks: Date[][] = [];
  absences: Absence[] = [];
  presences: Presence[] = [];

  public CalendarView = CalendarView;

  constructor(private router: Router, public dialog: MatDialog, private appointmentService: AppointmentService, private authService: AuthService) {
    this.appointments.forEach((appointment) => {
      appointment.color = this.getRandomColor();
    });
    this.generateView(this.currentView, this.viewDate);
    this.generateTimeSlots();
  }

  ngOnInit(): void {
    this.fetchAppointments();
    this.fetchAbsences();  // Fetch appointments on component initialization
    this.fetchPresences();

    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout(); // Clear user session if necessary
    this.router.navigate(['/auth/login']); // Navigate to login page
  }
  // logout(): void {
  //   this.authService.logout();
  //   window.location.href = '/auth/login'; // Redirect to login page
  // }


  //////////////////////////////////////////////////////////////// fetching
  fetchAbsences(): void {
    this.appointmentService.getAbsences().subscribe({
      next: (absences) => {
        this.absences = absences;
        console.log('Fetched absences:', this.absences);
      },
      error: (err) => {
        console.error('Error fetching absences:', err);
      },
    });
  }

  fetchPresences(): void {
    this.appointmentService.getPresences().subscribe({
      next: (presences) => {
        this.presences = presences;
        console.log('Fetched presences:', this.presences);
      },
      error: (err) => {
        console.error('Error fetching presences:', err);
      },
    });
  }

  fetchAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments.map((appointment) => {
          if (this.isPastDate(appointment.date)) {
            return {
              ...appointment,
              color: 'rgb(227, 227, 227)', // Gray color for past appointments
            };
          }
          return appointment;
        });
      },
      error: (error) => {
        console.error('Error fetching appointments:', error);
      },
    });
  }
  
  //////////////////////////////////////////////////////////////// fetching

  isPastDate(date: string | Date): boolean {
    const appointmentDate = new Date(date);
    const today = new Date();
    // Reset hours, minutes, and seconds for accurate comparison
    today.setHours(0, 0, 0, 0);
    return appointmentDate < today;
  }

  generateView(view: CalendarView, date: Date) {
    switch (view) {
      case CalendarView.Month:
        this.generateMonthView(date);
        break;
      case CalendarView.Week:
        this.generateWeekView(date);
        break;
      case CalendarView.Day:
        this.generateDayView(date);
        break;
      default:
        this.generateMonthView(date);
    }
  }

  getEventCountForDay(date: Date): number {
    return this.appointments.filter((appt) => this.isSameDate(appt.date, date)).length;
  }

  generateMonthView(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.weeks = [];
    this.monthDays = [];
    let week: Date[] = [];

    for (let day = start.getDay(); day > 0; day--) {
      const prevDate = new Date(start);
      prevDate.setDate(start.getDate() - day);
      week.push(prevDate);
      this.monthDays.push(prevDate);
    }

    for (let day = 1; day <= end.getDate(); day++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
      this.monthDays.push(currentDate);
      week.push(currentDate);
      if (week.length === 7) {
        this.weeks.push(week);
        week = [];
      }
    }

    for (let day = 1; this.monthDays.length % 7 !== 0; day++) {
      const nextDate = new Date(end);
      nextDate.setDate(end.getDate() + day);
      this.monthDays.push(nextDate);
    }

    for (let day = 1; week.length < 7; day++) {
      const nextDate = new Date(end);
      nextDate.setDate(end.getDate() + day);
      week.push(nextDate);
    }

    if (week.length > 0) {
      this.weeks.push(week);
    }
  }

  generateWeekView(date: Date) {
    const startOfWeek = this.startOfWeek(date);
    this.monthDays = [];

    for (let day = 0; day < 7; day++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + day);
      this.monthDays.push(weekDate);
    }
  }

  generateDayView(date: Date) {
    this.monthDays = [date];
  }

  generateTimeSlots() {
    this.timeSlots = [];
  
    for (let hour = 9; hour <= 16; hour++) {
      for (let min = 0; min < 60; min += 30) {
        if (hour === 16 && min === 30) {
          break;
        }
        const hh = hour < 10 ? '0' + hour : hour.toString();
        const mm = min === 0 ? '00' : '30';
        const time = `${hh}:${mm}`;
        this.timeSlots.push(time);
      }
    }
  }
  

  switchToView(view: CalendarView) {
    this.currentView = view;
    this.generateView(this.currentView, this.viewDate);
  }

  startOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(start.setDate(diff));
  }

  previous() {
    if (this.currentView === 'month') {
      this.viewDate = new Date(
        this.viewDate.setMonth(this.viewDate.getMonth() - 1)
      );
      this.generateMonthView(this.viewDate);
    } else if (this.currentView === 'week') {
      this.viewDate = new Date(
        this.viewDate.setDate(this.viewDate.getDate() - 7)
      );
      this.generateWeekView(this.viewDate);
    } else {
      this.viewDate = new Date(
        this.viewDate.setDate(this.viewDate.getDate() - 1)
      );
      this.generateDayView(this.viewDate);
    }
  }

  next() {
    if (this.currentView === 'month') {
      this.viewDate = new Date(
        this.viewDate.setMonth(this.viewDate.getMonth() + 1)
      );
      this.generateMonthView(this.viewDate);
    } else if (this.currentView === 'week') {
      this.viewDate = new Date(
        this.viewDate.setDate(this.viewDate.getDate() + 7)
      );
      this.generateWeekView(this.viewDate);
    } else {
      this.viewDate = new Date(
        this.viewDate.setDate(this.viewDate.getDate() + 1)
      );
      this.generateDayView(this.viewDate);
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  isCurrentTimeSlot(timeSlot: string): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
  
    const [slotHour, slotMinutes] = timeSlot.split(':').map(Number);
  
    // Check if the slot matches the current hour and minute range
    return slotHour === currentHour && currentMinutes >= slotMinutes && currentMinutes < slotMinutes + 30;
  }

  isSlotInAbsence(date: Date, timeSlot: string): boolean {
    return this.absences.some((absence) => {
      const [startHours, startMinutes] = absence.startTime.split(':').map(Number);
      const [endHours, endMinutes] = absence.endTime.split(':').map(Number);

      const absenceStart = new Date(absence.date);
      absenceStart.setHours(startHours, startMinutes);

      const absenceEnd = new Date(absence.date);
      absenceEnd.setHours(endHours, endMinutes);

      const slotDate = new Date(date);
      const [slotHours, slotMinutes] = timeSlot.split(':').map(Number);
      slotDate.setHours(slotHours, slotMinutes);

      return slotDate >= absenceStart && slotDate < absenceEnd;
    });
  }

  isSlotInPresence(date: Date, timeSlot: string): boolean {
    return this.presences.some((presence) => {
      const [startHours, startMinutes] = presence.startTime.split(':').map(Number);
      const [endHours, endMinutes] = presence.endTime.split(':').map(Number);
  
      const presenceStart = new Date(presence.date);
      presenceStart.setHours(startHours, startMinutes);
  
      const presenceEnd = new Date(presence.date);
      presenceEnd.setHours(endHours, endMinutes);
  
      const slotDate = new Date(date);
      const [slotHours, slotMinutes] = timeSlot.split(':').map(Number);
      slotDate.setHours(slotHours, slotMinutes);
  
      return slotDate >= presenceStart && slotDate < presenceEnd;
    });
  }
  

  

  isSelected(date: Date): boolean {
    if (!this.selectedDate) {
      return false;
    }
    return (
      date.getDate() === this.selectedDate.getDate() &&
      date.getMonth() === this.selectedDate.getMonth() &&
      date.getFullYear() === this.selectedDate.getFullYear()
    );
  }

  isSameDate(date1: string, date2: Date): boolean {
    const convertedDate = new Date(date1);

    return (
      convertedDate.getDate() === date2.getDate() &&
      convertedDate.getMonth() === date2.getMonth() &&
      convertedDate.getFullYear() === date2.getFullYear()
    );
  }

  selectDate(date?: Date, startTime?: string) {
    if (date) {
      this.selectedDate = date;
    } else {
      this.selectedDate = new Date();
    }
    this.selectedStartTime = startTime;
    this.openDialog();
  }




  addAppointment(date: string, 
                name_and_surname: string, 
                type: string, 
                age: number, 
                gender: string, 
                startTime: string, 
                endTime: string, 
                additional_info: string,
                color: string,): void {
    const newAppointment: Appointment = {
      date,
      name_and_surname,
      type,
      age,
      gender,
      startTime,
      endTime,
      additional_info,
      color,
    };

    this.appointmentService.addAppointment(newAppointment).subscribe({
      next: () => {
        this.fetchAppointments(); 
      },
      error: (err) => {
        console.error('Error adding appointment:', err);
      },
    });
  }

  openDialog(): void {
    const hour = new Date().getHours();
    const minutes = new Date().getMinutes();
    const h = hour < 10 ? `0${hour}` : hour;
    const m = minutes < 10 ? `0${minutes}` : minutes;
    const dialogRef = this.dialog.open(AppointmentDialogComponent, {
      width: '500px',
      panelClass: 'dialog-container',
      data: {
        date: this.selectedDate,
        name_and_surname: '',
        type: '',
        age: 0,
        gender: '',
        startTime: this.selectedStartTime || `${h}:${m}`,
        endTime: this.selectedStartTime || `${h}:${m}`,
        additional_info: '',
        absences: this.absences,
        appointments: this.appointments,
        color: '',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addAppointment(
          result.date,
          result.name_and_surname,
          result.type,
          result.age,
          result.gender,
          result.startTime,
          result.endTime,
          result.additional_info,
          result.color,
        );
      }
    });
  }


  openBasket(): void {
    const dialogRef = this.dialog.open(BasketComponent, {
      width: '500px', 
      panelClass: 'dialog-container', 

    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Koszyk zamknięty, wynik:', result);
      }
    });
  }


  addAbsence(): void {
    const dialogRef = this.dialog.open(AbsenceComponent, {
      width: '500px',
      panelClass: 'dialog-container',
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result && Array.isArray(result)) {
        console.log('Generated Absences:', result); // Log the generated list of absences
  
        // Loop through the generated absences and send each one to the backend
        result.forEach((absence) => {
          this.appointmentService.addAbsence(absence).subscribe({
            next: (response) => {
              console.log('Absence added successfully:', response);
              this.fetchAbsences(); // Refresh the absences list after each addition
            },
            error: (err) => {
              console.error('Error adding absence:', err);
            },
          });
        });
      }
    });
  }
  


  addPresence(): void {
    const dialogRef = this.dialog.open(PresenceComponent, {
      width: '500px',
      panelClass: 'dialog-container',
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result && Array.isArray(result)) {
        console.log('Generated Presences:', result); // Log the generated list of presences
  
        // Loop through the generated presences and send each one to the backend
        result.forEach((presence) => {
          const formattedPresence = {
            date: presence.date, // Formatted date from the dialog
            startTime: presence.startTime, // Start time
            endTime: presence.endTime, // End time
            name_and_surname: presence.name_and_surname || null, // Optional field
            type: presence.type || null, // Optional field
            age: presence.age || null, // Optional field
            gender: presence.gender || null, // Optional field
            additional_info: presence.additional_info || null, // Optional field
          };
  
          this.appointmentService.addPresence(formattedPresence).subscribe({
            next: (response) => {
              console.log('Presence added successfully:', response);
              this.fetchPresences(); // Refresh the presences list
            },
            error: (err) => {
              console.error('Error adding presence:', err);
            },
          });
        });
      }
    });
  }
  

 
  getAppointmentsForDate(day: Date, timeSlots: string[]) {
    return this.appointments
      .filter((appointment) => {
        return this.isSameDate(appointment.date, day);
      })
      .map((appointment) => {
        const startTimeIndex = timeSlots.indexOf(appointment.startTime);
        const endTimeIndex = timeSlots.indexOf(appointment.endTime);
        return { ...appointment, startTimeIndex, endTimeIndex };
      });
  }

  drop(event: CdkDragDrop<Appointment[]>, date: Date, slot?: string) {
    const movedAppointment = event.item.data;
    movedAppointment.date = date;
    if (slot) {
      movedAppointment.startTime = slot;
      movedAppointment.endTime = slot;
    }
  }

  // viewToday(): void {
  //   this.viewDate = new Date();
  //   this.generateMonthView(this.viewDate);
  // }

  viewToday(): void {
    this.viewDate = new Date();
  
    if (this.currentView === 'month') {
      this.generateMonthView(this.viewDate);
    } else if (this.currentView === 'week') {
      this.generateWeekView(this.viewDate);
    } else if (this.currentView === 'day') {
      this.generateDayView(this.viewDate);
    }
  }

  isCurrentMonth(date: Date): boolean {
    return (
      date.getMonth() === this.viewDate.getMonth() &&
      date.getFullYear() === this.viewDate.getFullYear()
    );
  }

  getAppointmentsForDateTime(date: Date, timeSlot: string): Appointment[] {
    const appointmentsForDateTime: Appointment[] = this.appointments.filter(
      (appointment) =>
        this.isSameDate(appointment.date, date) &&
        appointment.startTime <= timeSlot &&
        appointment.endTime >= timeSlot
    );

    return appointmentsForDateTime;
  }

  getRandomColor(): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const a = 0.4;
    return `rgba(${r},${g},${b},${a})`;
  }


  editAppointment(appointment: Appointment, event: Event) {
    event.preventDefault();
  
    const dialogRef = this.dialog.open(AppointmentDialogComponent, {
      width: '500px',
      panelClass: 'dialog-container',
      data: {
        ...appointment, 
        absences: this.absences,
        appointments: this.appointments
      },
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const index = this.appointments.findIndex(
          (appointment) => appointment.id === result.id
        );
        if (result.remove) {
          this.appointments.splice(index, 1); // Remove the appointment
        } else {
          this.appointments[index] = result; // Update the appointment
        }
      }
    });
  }
  
  
  

}  