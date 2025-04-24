import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EventDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import { BasketComponent } from '../basket/basket.component';
import { EventService, Event as CustomEvent, EventWithDetails } from '../event.service';
import { AuthService, User } from '../auth/auth.service';
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
  events: EventWithDetails[] = [];
  currentView: CalendarView = CalendarView.Week;
  timeSlots: string[] = [];
  now: Date = new Date();
  weeks: Date[][] = [];

  public CalendarView = CalendarView;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private eventService: EventService,
    private authService: AuthService
  ) {
    this.generateView(this.currentView, this.viewDate);
    this.generateTimeSlots();
  }

  ngOnInit(): void {
    this.fetchEvents();

    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout(); // Clear user session if necessary
    this.router.navigate(['/auth/login']); // Navigate to login page
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile/issues']); // Navigate to the technical issues page
  }

  navigateToArtists(): void {
    this.router.navigate(['/artists']);
  }

  getColorForEventType(type: string): string {
    switch (type.toLowerCase()) {
      case 'concert':
        return 'rgb(252, 206, 248)'; 
      case 'sports':
        return 'rgb(182, 214, 130)'; 
      case 'festival':
        return 'rgb(240, 212, 169)';
      case 'theather':
        return 'rgb(244, 143, 107)';;
      default:
        return '#9E9E9E'; 
    }
  }

  formatTime(timeString?: string): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  }
  

  //////////////////////////////////////////////////////////////// fetching
  fetchEvents(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events.map((eventWithDetails) => {
          if (this.isPastDate(eventWithDetails.event.date)) {
            return {
              ...eventWithDetails,
              event: {
                ...eventWithDetails.event,
                color: 'rgb(227, 227, 227)', // Gray color for past events
              }
            };
          }
          return eventWithDetails;
        });
      },
      error: (error) => {
        console.error('Error fetching events:', error);
      },
    });
  }

  //////////////////////////////////////////////////////////////// fetching

  isPastDate(date: string | Date): boolean {
    const eventDate = new Date(date);
    const today = new Date();
    // Reset hours, minutes, and seconds for accurate comparison
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
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
    return this.events.filter((event) => this.isSameDate(event.event.date, date)).length;
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

    for (let hour = 9; hour <= 23; hour++) {
      for (let min = 0; min < 60; min += 30) {
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

  createEvent(event: CustomEvent): void {
    this.eventService.createEvent(event).subscribe({
      next: () => {
        this.fetchEvents();
      },
      error: (err) => {
        console.error('Error adding event:', err);
      },
    });
  }

  openDialog(): void {
    // Check if user is logged in
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const hour = new Date().getHours();
    const minutes = new Date().getMinutes();
    const h = hour < 10 ? `0${hour}` : hour;
    const m = minutes < 30 ? '00' : '30';

    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '500px',
      panelClass: 'dialog-container',
      data: {
        title: '',
        type: 'CONCERT',
        date: this.selectedDate,
        start_hour: this.selectedStartTime || `${h}:${m}`,
        end_hour: this.getEndTime(this.selectedStartTime || `${h}:${m}`),
        price: 0,
        created_by: this.currentUser?.id,
        events: this.events.map(e => e.event)
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createEvent(result);
      }
    });
  }

  getEndTime(startTime: string): string {
    // Default to 1 hour later
    const [hours, minutes] = startTime.split(':').map(Number);
    let endHour = hours + 1;
    if (endHour > 23) endHour = 23;

    const endHourStr = endHour < 10 ? `0${endHour}` : `${endHour}`;
    return `${endHourStr}:${minutes < 10 ? '0' + minutes : minutes}`;
  }

  openBasket(): void {
    const dialogRef = this.dialog.open(BasketComponent, {
      width: '500px',
      panelClass: 'dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Basket closed, result:', result);
      }
    });
  }

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

  getEventsForDateTime(date: Date, timeSlot: string): EventWithDetails[] {
    const eventsForDateTime: EventWithDetails[] = this.events.filter(
      (eventWithDetails) => {
        const event = eventWithDetails.event;
        return (
          this.isSameDate(event.date, date) &&
          event.start_hour && event.end_hour &&
          event.start_hour <= timeSlot &&
          event.end_hour > timeSlot
        );
      }
    );

    return eventsForDateTime;
  }

  generateRandomColor(): string {
    const r = Math.floor(Math.random() * 156) + 100; // Keeping it lighter (100-255)
    const g = Math.floor(Math.random() * 156) + 100;
    const b = Math.floor(Math.random() * 156) + 100;
    const a = 0.7; // Semi-transparent
    return `rgba(${r},${g},${b},${a})`;
  }

  editEvent(eventWithDetails: EventWithDetails, ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();

    // Check if user is logged in
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const event = eventWithDetails.event;

    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '500px',
      panelClass: 'dialog-container',
      data: {
        id: event.id,
        title: event.title,
        type: event.type,
        date: event.date,
        start_hour: event.start_hour,
        end_hour: event.end_hour,
        place: event.place,
        price: event.price,
        seats_no: event.seats_no,
        description: event.description,
        created_by: event.created_by,
        artists: event.artists,
        events: this.events.map(e => e.event)
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.remove) {
          // Handle deleted event
          this.events = this.events.filter(e => e.event.id !== result.id);
        } else {
          // Refresh events list after update
          this.fetchEvents();
        }
      }
    });
  }
}
