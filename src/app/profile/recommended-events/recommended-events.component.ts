import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
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
    MatTabsModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    ReactiveFormsModule,
    DatePipe
  ],
  providers: [DatePipe]
})
export class RecommendedEventsComponent implements OnInit {
  isLoading = true;
  popularEvents: EventWithDetails[] = [];
  personalizedEvents: EventWithDetails[] = [];
  filtersForm: FormGroup;
  
  availableEventTypes = ['FESTIVAL', 'CONCERT', 'THEATER', 'SPORTS', 'COMEDY', 'EXHIBITION'];
  selectedKeywords: string[] = [];
  
  constructor(
    private eventService: EventService,
    private datePipe: DatePipe,
    private fb: FormBuilder
  ) {
    this.filtersForm = this.fb.group({
      eventTypes: [[]],
      keywords: ['']
    });
  }

  ngOnInit(): void {
    this.loadPopularEvents();
    this.loadPersonalizedEvents();
  }

  loadPopularEvents(): void {
    this.isLoading = true;
    this.eventService.getPopularEvents(7).subscribe({
      next: (events: EventWithDetails[]) => {
        this.popularEvents = events;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching popular events:', error);
        this.isLoading = false;
      }
    });
  }

  loadPersonalizedEvents(): void {
    const formValue = this.filtersForm.value;
    const params: any = {};
    
    if (formValue.eventTypes && formValue.eventTypes.length > 0) {
      params.types = formValue.eventTypes;
    }
    
    if (this.selectedKeywords.length > 0) {
      params.keywords = this.selectedKeywords;
    }

    this.eventService.getPersonalizedEvents(params, 10).subscribe({
      next: (events: EventWithDetails[]) => {
        this.personalizedEvents = events;
      },
      error: (error: any) => {
        console.error('Error fetching personalized events:', error);
      }
    });
  }

  addKeyword(): void {
    const keywordInput = this.filtersForm.get('keywords');
    const keyword = keywordInput?.value?.trim();
    
    if (keyword && !this.selectedKeywords.includes(keyword)) {
      this.selectedKeywords.push(keyword);
      keywordInput?.setValue('');
      this.loadPersonalizedEvents();
    }
  }

  removeKeyword(keyword: string): void {
    const index = this.selectedKeywords.indexOf(keyword);
    if (index >= 0) {
      this.selectedKeywords.splice(index, 1);
      this.loadPersonalizedEvents();
    }
  }

  onEventTypesChange(): void {
    this.loadPersonalizedEvents();
  }

  onKeywordKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addKeyword();
    }
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
    } else if (type.includes('festival')) {
      return 'assets/images/festival.jpg';
    }
    
    return 'assets/images/event.jpg';
  }
} 