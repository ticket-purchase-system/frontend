import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import { BasketComponent } from '../basket/basket.component'
import { AppointmentService, Appointment } from '../appointment.service'; 
import { AbsenceComponent } from '../absence/absence.component';


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
  viewDate: Date = new Date();
  selectedDate: Date | null = null;
  selectedStartTime: string | undefined;
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthDays: Date[] = [];
  appointments: Appointment[] = [];
  currentView: CalendarView = CalendarView.Week;
  timeSlots: string[] = [];
  now: Date = new Date();
  weeks: Date[][] = [];

  absences = [
    {
      startDate: '2025-01-16',
      startTime: '15:00',
      endDate: '2025-01-16',
      endTime: '16:00',
    },
  ];

  public CalendarView = CalendarView;

  constructor(public dialog: MatDialog, private appointmentService: AppointmentService) {
    this.appointments.forEach((appointment) => {
      appointment.color = this.getRandomColor();
    });
    this.generateView(this.currentView, this.viewDate);
    this.generateTimeSlots();
  }

  ngOnInit(): void {
    this.fetchAppointments();  // Fetch appointments on component initialization
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
  
      const absenceStart = new Date(absence.startDate);
      absenceStart.setHours(startHours, startMinutes);
  
      const absenceEnd = new Date(absence.endDate);
      absenceEnd.setHours(endHours, endMinutes);
  
      const slotDate = new Date(date);
      const [slotHours, slotMinutes] = timeSlot.split(':').map(Number);
      slotDate.setHours(slotHours, slotMinutes);
  
      return slotDate >= absenceStart && slotDate < absenceEnd;
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


  fetchAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments; // Store fetched appointments
      },
      error: (error) => {
        console.error('Error fetching appointments:', error); // Handle any error
      },
    });
  }


  // // firebase ?????????
  // fetchAppointments(): void {
  //   this.appointmentService.getAppointments_from_firebase().subscribe({
  //     next: (appointments) => {
  //       this.appointments = appointments; // Store fetched appointments
  //       console.log('Appointments fetched:', this.appointments); // Log appointments to check
  //     },
  //     error: (error) => {
  //       console.error('Error fetching appointments:', error); // Handle any error
  //     },
  //   });
  // }


  addAppointment(date: string, title: string, startTime: string, endTime: string): void {
    const newAppointment: Appointment = {
      date,
      title,
      startTime,
      endTime,
      // color: this.getRandomColor(),
    };

    this.appointmentService.addAppointment(newAppointment).subscribe({
      next: () => {
        this.fetchAppointments(); // Fetch updated list after adding a new appointment
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
        title: '',
        startTime: this.selectedStartTime || `${h}:${m}`,
        endTime: this.selectedStartTime || `${h}:${m}`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addAppointment(
          result.date,
          result.title,
          result.startTime,
          result.endTime
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
      if (result) {
        console.log('Koszyk zamknięty, wynik:', result);
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
    data: appointment,
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      const index = this.appointments.findIndex(
        (appointment) => appointment.id === result.id
      );
      if (result.remove) {
        this.appointments.splice(index, 1);  // Usunięcie wydarzenia
      } else {
        this.appointments[index] = result;  // Zaktualizowanie wydarzenia
      }
    }
  });
}

}  