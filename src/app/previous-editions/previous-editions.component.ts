import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from "@angular/forms";
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { environment } from "../../environments/environment";
import { httpHelper } from "../utils/HttpHelper";
import { PhotoUploadDialogComponent } from '../photo-upload-dialog/photo-upload-dialog.component';

interface Review {
  id: number;
  numberOfStars: string;
  comment: string;
  date: string;
  rating: number;
}

interface Photo {
  id: number;
  url: string;
  caption: string;
  uploaded_at: string;
}

interface EventObject {
  id: number;
  title: string;
  type: string;
  date: string;
  price: number;
  description: string;
  start_hour?: string;
  end_hour?: string;
  place?: string;
  seats_no?: number;
}

interface EventWithReviews {
  event: EventObject;
  reviews: Review[];
  photos: Photo[];
  review_count: number;
  photo_count: number;
}

interface ApiResponse {
  past_events_with_reviews: EventWithReviews[];
  count: number;
}

@Component({
  selector: 'app-previous-editions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatOptionModule,
    MatDialogModule
  ],
  template: `
    <div class="previous-editions-container">
      <div class="header">
        <h2>
          <mat-icon>history</mat-icon>
          Past events & reviews
        </h2>

        <!-- Search and Filter Controls -->
        <div class="controls">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search events</mat-label>
            <input matInput
                   [(ngModel)]="searchQuery"
                   (keyup.enter)="onSearch()"
                   placeholder="Search by event title">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="limit-field">
            <mat-label>Show</mat-label>
            <mat-select [(value)]="limit" (selectionChange)="onLimitChange()">
              <mat-option [value]="5">5 events</mat-option>
              <mat-option [value]="10">10 events</mat-option>
              <mat-option [value]="20">20 events</mat-option>
              <mat-option [value]="50">50 events</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-raised-button color="primary" (click)="onSearch()">
            <mat-icon>search</mat-icon>
            Search
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading past events...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <p>{{ error }}</p>
        <button mat-button color="primary" (click)="loadPastEvents()">
          <mat-icon>refresh</mat-icon>
          Try Again
        </button>
      </div>

      <!-- Events List -->
      <div *ngIf="!loading && !error" class="events-list">
        <div *ngIf="pastEvents.length === 0" class="no-events">
          <mat-icon>event_busy</mat-icon>
          <h3>No past events found</h3>
          <p>Try adjusting your search criteria.</p>
        </div>

        <mat-card *ngFor="let eventData of pastEvents" class="event-card">
          <!-- Event Header -->
          <mat-card-header>
            <div mat-card-avatar class="event-avatar">
              <mat-icon>event</mat-icon>
            </div>
            <mat-card-title>{{ eventData.event.title }}</mat-card-title>
            <mat-card-subtitle>
              <div class="event-meta">
                <span class="event-type">
                  <mat-icon>category</mat-icon>
                  {{ eventData.event.type }}
                </span>
                <span class="event-date">
                  <mat-icon>calendar_today</mat-icon>
                  {{ formatDate(eventData.event.date) }}
                </span>
                <span class="event-price">
                  <mat-icon>attach_money</mat-icon>
                  {{ eventData.event.price }}
                </span>
              </div>
            </mat-card-subtitle>
          </mat-card-header>

          <!-- Event Details -->
          <mat-card-content>
            <div class="event-details">
              <p class="event-description">{{ eventData.event.description }}</p>

              <div class="event-info" *ngIf="eventData.event.place || eventData.event.start_hour">
                <div *ngIf="eventData.event.place" class="info-item">
                  <mat-icon>place</mat-icon>
                  <span>{{ eventData.event.place }}</span>
                </div>
                <div *ngIf="eventData.event.start_hour" class="info-item">
                  <mat-icon>access_time</mat-icon>
                  <span>{{ eventData.event.start_hour }}
                    <span *ngIf="eventData.event.end_hour">- {{ eventData.event.end_hour }}</span>
                  </span>
                </div>
                <div *ngIf="eventData.event.seats_no" class="info-item">
                  <mat-icon>event_seat</mat-icon>
                  <span>{{ eventData.event.seats_no }} seats</span>
                </div>
              </div>
            </div>

            <!-- Photos Section -->
            <div class="photos-section" *ngIf="eventData.photos && eventData.photos.length > 0">
              <h4>
                <mat-icon>photo_library</mat-icon>
                Event Photos ({{ eventData.photo_count }})
              </h4>

              <div class="photo-preview">
                <div class="preview-photos">
                  <div *ngFor="let photo of getPreviewPhotos(eventData.photos); let i = index"
                       class="photo-thumbnail"
                       (click)="openPhotoDialog(eventData.photos, i)">
                    <img [src]="photo.url"
                         [alt]="photo.caption || 'Event photo'"
                         (error)="onImageError($event)">
                    <div class="photo-overlay">
                      <mat-icon>zoom_in</mat-icon>
                    </div>
                  </div>

                  <!-- Show more photos indicator -->
                  <div *ngIf="eventData.photos.length > 4"
                       class="more-photos"
                       (click)="viewAllPhotos(eventData.photos)">
                    <div class="more-photos-content">
                      <mat-icon>add</mat-icon>
                      <span>+{{ eventData.photos.length - 4 }}</span>
                    </div>
                  </div>
                </div>

                <button mat-button
                        class="view-all-photos-btn"
                        (click)="viewAllPhotos(eventData.photos)"
                        *ngIf="eventData.photos.length > 4">
                  View All {{ eventData.photos.length }} Photos
                </button>
              </div>
            </div>

            <!-- Add Photos Button (Conditional) -->
            <div class="photo-upload-section" *ngIf="canUploadPhotos(eventData.event)">
              <button mat-raised-button
                      color="accent"
                      (click)="openPhotoUploadDialog(eventData.event)">
                <mat-icon>add_photo_alternate</mat-icon>
                Add Photos
              </button>
            </div>

            <!-- Reviews Section -->
            <div class="reviews-section" *ngIf="eventData.review_count > 0">
              <div class="reviews-header">
                <h4>
                  <mat-icon>rate_review</mat-icon>
                  Reviews ({{ eventData.review_count }})
                </h4>
              </div>

              <div class="reviews-list">
                <div *ngFor="let review of eventData.reviews" class="review-item">
                  <div class="review-header">
                    <div class="review-stars">
                      <mat-icon
                        *ngFor="let star of getStarArray(review.numberOfStars)"
                        [class.filled]="star === 1"
                        class="star">
                        star
                      </mat-icon>
                    </div>
                    <span class="review-date">{{ formatDateTime(review.date) }}</span>
                  </div>
                  <p class="review-comment">{{ review.comment }}</p>
                </div>
              </div>
            </div>

            <!-- No Reviews Message -->
            <div *ngIf="eventData.review_count === 0" class="no-reviews">
              <mat-icon>rate_review</mat-icon>
              <span>No reviews yet for this event</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styleUrls: ['./previous-editions.component.css']
})
export class PreviousEditionsComponent implements OnInit {
  pastEvents: EventWithReviews[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';
  limit = 10;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPastEvents();
  }

  loadPastEvents(): void {
    this.loading = true;
    this.error = null;

    let url = 'events/past_events_with_reviews/';
    const params: string[] = [];

    if (this.searchQuery.trim()) {
      params.push(`query=${encodeURIComponent(this.searchQuery.trim())}`);
    }

    if (this.limit > 0) {
      params.push(`limit=${this.limit}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    this.http.get<ApiResponse>(`${environment.apiUrl}/${url}`, { headers: httpHelper.getAuthHeaders() }).subscribe({
      next: (response) => {
        this.pastEvents = response.past_events_with_reviews;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load past events. Please try again.';
        this.loading = false;
        console.error('Error loading past events:', error);
      }
    });
  }

  onSearch(): void {
    this.loadPastEvents();
  }

  onLimitChange(): void {
    this.loadPastEvents();
  }

  getStarArray(numberOfStars: string): number[] {
    const stars = parseInt(numberOfStars, 10);
    return Array(5).fill(0).map((_, i) => i < stars ? 1 : 0);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  // Photo-related methods
  getPreviewPhotos(photos: Photo[]): Photo[] {
    return photos.slice(0, 4); // Show first 4 photos
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder-image.png'; // Fallback image
    img.alt = 'Image not available';
  }

  openPhotoDialog(photos: Photo[], startIndex = 0): void {
    // You can implement a photo gallery dialog here
    // For now, we'll just open the first photo in a new tab
    if (photos[startIndex]) {
      window.open(photos[startIndex].url, '_blank');
    }
  }

  viewAllPhotos(photos: Photo[]): void {
    // You can implement a photo gallery dialog here
    console.log('View all photos:', photos);
    // For now, just show a message
    this.snackBar.open(`Viewing all ${photos.length} photos`, 'Close', { duration: 2000 });
  }

  canUploadPhotos(event: EventObject): boolean {
    // Implement your condition here
    // For example: only allow photo upload if user is the event creator
    // or if the event happened within the last 30 days

    // Example condition: allow upload for events in the last 30 days
    const eventDate = new Date(event.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return eventDate >= thirtyDaysAgo;

    // You can replace this with your own logic, such as:
    // return this.currentUser.id === event.created_by;
    // return this.userService.canUploadPhotos(event);
  }

  openPhotoUploadDialog(event: EventObject): void {
    const dialogRef = this.dialog.open(PhotoUploadDialogComponent, {
      width: '90vw',
      maxWidth: '800px',
      data: {
        eventId: event.id,
        eventTitle: event.title
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.uploaded) {
        // Refresh the events list to show newly uploaded photos
        this.loadPastEvents();
        this.snackBar.open(
          `${result.count} photo(s) uploaded successfully!`,
          'Close',
          { duration: 3000 }
        );
      }
    });
  }
}
