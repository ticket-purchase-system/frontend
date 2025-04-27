import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventService, Event, EventWithDetails } from '../../event.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-recommended-events',
  templateUrl: './recommended-events.component.html',
  styleUrls: ['./recommended-events.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    DatePipe
  ],
  providers: [DatePipe]
})
export class RecommendedEventsComponent implements OnInit {
  isLoading = true;
  recommendedEvents: EventWithDetails[] = [];
  
  constructor(
    private eventService: EventService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadRecommendedEvents();
  }

  loadRecommendedEvents(): void {

    const currentDate = new Date();

    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    const startDate = this.formatDate(currentDate);
    const endDate = this.formatDate(sixMonthsLater);
    
    this.isLoading = true;

    this.eventService.getEvents(undefined, startDate, endDate).subscribe({
      next: (events) => {
        this.recommendedEvents = this.simulateRecommendations(events);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching recommended events:', error);
        this.isLoading = false;
      }
    });
  }
  
  private simulateRecommendations(events: EventWithDetails[]): EventWithDetails[] {
    if (!events || events.length === 0) return [];

    events.sort((a, b) => {
      const dateA = new Date(a.event.date);
      const dateB = new Date(b.event.date);
      return dateA.getTime() - dateB.getTime();
    });
    
    return events.slice(0, 5);
  }
  
  private formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }
  
  getEventImageUrl(eventType: string): string {

    const type = eventType.toLowerCase();
    
    if (type.includes('concert')) {
      return 'assets/images/concert.jpg';
    } else if (type.includes('theater')) {
      return 'assets/images/theater.jpg';
    } else if (type.includes('sport')) {
      return 'assets/images/sports.jpg';
    } else if (type.includes('comedy')) {
      return 'assets/images/comedy.jpg';
    } else if (type.includes('exhibition')) {
      return 'assets/images/exhibition.jpg';
    }
    
    
    return 'assets/images/event.jpg';
  }
} 