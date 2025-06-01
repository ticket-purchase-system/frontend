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
    <div class="min-h-screen bg-gray-50 p-10">
      <div class="max-w-7xl mx-auto">
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-blue-100 rounded-lg">
              <mat-icon class="text-blue-600">history</mat-icon>
            </div>
            <h3 class="font-bold text-gray-900 pt-3">Past events & reviews</h3>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex flex-wrap gap-4 items-center">
              <div class="flex-1 min-w-80">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Search events</mat-label>
                  <input matInput
                         [(ngModel)]="searchQuery"
                         (keyup.enter)="onSearch()"
                         placeholder="Search by event title"
                         class="text-gray-700">
                  <mat-icon matSuffix class="text-gray-400">search</mat-icon>
                </mat-form-field>
              </div>

              <div class="min-w-32">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Show</mat-label>
                  <mat-select [(value)]="limit" (selectionChange)="onLimitChange()">
                    <mat-option [value]="5">5 events</mat-option>
                    <mat-option [value]="10">10 events</mat-option>
                    <mat-option [value]="20">20 events</mat-option>
                    <mat-option [value]="50">50 events</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <button mat-raised-button
                      color="primary"
                      (click)="onSearch()"
                      class="h-14 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors">
                <mat-icon class="mr-2">search</mat-icon>
                Search
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="loading" class="flex flex-col items-center justify-center py-16">
          <mat-spinner class="mb-4"></mat-spinner>
          <p class="text-gray-600 text-lg">Loading past events...</p>
        </div>

        <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <mat-icon class="text-red-500 text-4xl mb-4">error</mat-icon>
          <p class="text-red-700 text-lg mb-4">{{ error }}</p>
          <button mat-raised-button
                  color="primary"
                  (click)="loadPastEvents()"
                  class="bg-red-600 hover:bg-red-700 text-white">
            <mat-icon class="mr-2">refresh</mat-icon>
            Try Again
          </button>
        </div>

        <div *ngIf="!loading && !error">
          <div *ngIf="pastEvents.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <mat-icon class="text-gray-400 text-6xl mb-4">event_busy</mat-icon>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No past events found</h3>
            <p class="text-gray-600">Try adjusting your search criteria.</p>
          </div>

          <div class="space-y-6">
            <div *ngFor="let eventData of pastEvents"
                 class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">

              <div class="p-6 border-b border-gray-100">
                <div class="flex items-start gap-4">
                  <div class="p-3 bg-blue-500 rounded-xl shadow-sm">
                    <mat-icon class="text-white text-2xl">event</mat-icon>
                  </div>

                  <div class="flex-1 min-w-0 pt-1">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">{{ eventData.event.title }}</h3>

                    <div class="flex flex-wrap gap-4 text-sm">
                      <div class="flex items-center gap-1 text-gray-600">
                        <mat-icon class="text-base">category</mat-icon>
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                          {{ eventData.event.type }}
                        </span>
                      </div>

                      <div class="flex items-center gap-1 text-gray-600">
                        <mat-icon class="text-base">calendar_today</mat-icon>
                        <span>{{ formatDate(eventData.event.date) }}</span>
                      </div>

                      <div class="flex items-center gap-1 text-gray-600">
                        <mat-icon class="text-base">attach_money</mat-icon>
                        <span class="font-semibold text-green-600">{{ eventData.event.price }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-6">
                <div class="mb-6">
                  <p class="text-gray-700 leading-relaxed mb-4">{{ eventData.event.description }}</p>

                  <div class="flex flex-wrap gap-4 text-sm" *ngIf="eventData.event.place || eventData.event.start_hour">
                    <div *ngIf="eventData.event.place" class="flex items-center gap-2 text-gray-600">
                      <mat-icon class="text-base">place</mat-icon>
                      <span>{{ eventData.event.place }}</span>
                    </div>

                    <div *ngIf="eventData.event.start_hour" class="flex items-center gap-2 text-gray-600">
                      <mat-icon class="text-base">access_time</mat-icon>
                      <span>{{ eventData.event.start_hour }}
                        <span *ngIf="eventData.event.end_hour"> - {{ eventData.event.end_hour }}</span>
                      </span>
                    </div>

                    <div *ngIf="eventData.event.seats_no" class="flex items-center gap-2 text-gray-600">
                      <mat-icon class="text-base">event_seat</mat-icon>
                      <span>{{ eventData.event.seats_no }} seats</span>
                    </div>
                  </div>
                </div>

                <div class="mb-6" *ngIf="eventData.photos && eventData.photos.length > 0">
                  <div class="flex items-center gap-2 mb-4">
                    <mat-icon class="text-blue-500">photo_library</mat-icon>
                    <h6 class="font-semibold text-gray-900 mb-3 pt-3">
                      Event photos ({{ eventData.photo_count }})
                    </h6>
                  </div>

                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div *ngFor="let photo of getPreviewPhotos(eventData.photos); let i = index"
                         class="relative group cursor-pointer rounded-lg overflow-hidden aspect-square"
                         (click)="openPhotoDialog(eventData.photos, i)">
                      <img [src]="photo.url"
                           [alt]="photo.caption || 'Event photo'"
                           (error)="onImageError($event)"
                           class="w-full h-full object-cover transition-transform group-hover:scale-105">
                      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <mat-icon class="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          zoom_in
                        </mat-icon>
                      </div>
                    </div>

                    <div *ngIf="eventData.photos.length > 4"
                         class="relative cursor-pointer rounded-lg overflow-hidden aspect-square bg-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors"
                         (click)="viewAllPhotos(eventData.photos)">
                      <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors">
                        <mat-icon class="text-2xl mb-1">add</mat-icon>
                        <span class="text-sm font-medium">+{{ eventData.photos.length - 4 }}</span>
                      </div>
                    </div>
                  </div>

                  <button mat-stroked-button
                          (click)="viewAllPhotos(eventData.photos)"
                          *ngIf="eventData.photos.length > 4"
                          class="text-blue-600 border-blue-300 hover:bg-blue-50">
                    View all {{ eventData.photos.length }} photos
                  </button>
                </div>

                <div class="mb-6" *ngIf="canUploadPhotos(eventData.event)">
                  <button mat-button
                          (click)="openPhotoUploadDialog(eventData.event)"
                          class="bg-blue-500 text-white">
                    <mat-icon class="mr-2">add_photo_alternate</mat-icon>
                    Add photos
                  </button>
                </div>

                <div *ngIf="eventData.review_count > 0" class="border-t border-gray-100 pt-6">
                  <div class="flex items-center gap-2 mb-4">
                    <mat-icon class="text-yellow-500">rate_review</mat-icon>
                    <h4 class="text-lg font-semibold text-gray-900">
                      Reviews ({{ eventData.review_count }})
                    </h4>
                  </div>

                  <div class="space-y-4">
                    <div *ngFor="let review of eventData.reviews"
                         class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-1">
                          <mat-icon
                            *ngFor="let star of getStarArray(review.numberOfStars)"
                            [class]="star === 1 ? 'text-yellow-400' : 'text-gray-300'"
                            class="text-lg">
                            star
                          </mat-icon>
                        </div>
                        <span class="text-sm text-gray-500">{{ formatDateTime(review.date) }}</span>
                      </div>
                      <p class="text-gray-700 leading-relaxed">{{ review.comment }}</p>
                    </div>
                  </div>
                </div>

                <div *ngIf="eventData.review_count === 0"
                     class="flex items-center gap-2 text-gray-500 border-t border-gray-100 pt-6">
                  <mat-icon>rate_review</mat-icon>
                  <span>No reviews yet for this event</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-mdc-form-field {
      .mat-mdc-text-field-wrapper {
        background-color: white;
      }

      .mat-mdc-form-field-flex {
        border-radius: 8px;
      }
    }

    ::ng-deep .mat-mdc-raised-button {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      font-weight: 500;
    }

    ::ng-deep .mat-mdc-outlined-button {
      font-weight: 500;
    }

    ::ng-deep .mat-mdc-card {
      border-radius: 12px;
    }

    .bg-gradient-to-br {
      background: linear-gradient(to bottom right, var(--tw-gradient-stops));
    }

    .aspect-square {
      aspect-ratio: 1 / 1;
    }
  `]
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

        console.log(this.pastEvents);
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

  getPreviewPhotos(photos: Photo[]): Photo[] {
    return photos.slice(0, 4);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder-image.png';
    img.alt = 'Image not available';
  }

  openPhotoDialog(photos: Photo[], startIndex = 0): void {
    if (photos[startIndex]) {
      window.open(photos[startIndex].url, '_blank');
    }
  }

  viewAllPhotos(photos: Photo[]): void {
    console.log('View all photos:', photos);
    this.snackBar.open(`Viewing all ${photos.length} photos`, 'Close', { duration: 2000 });
  }

  canUploadPhotos(event: EventObject): boolean {
    const eventDate = new Date(event.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return eventDate >= thirtyDaysAgo;
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
