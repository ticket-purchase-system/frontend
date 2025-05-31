import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Review } from '../review-service.service';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatDividerModule} from "@angular/material/divider";
import {StarRatingComponent} from "../star-rating/star-rating.component";

@Component({
  selector: 'app-review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatCardModule,
    MatDividerModule,
    StarRatingComponent,
  ]
})
export class ReviewListComponent implements OnInit, OnChanges {
  @Input() reviews: Review[] = [];
  @Input() showHeader = true;
  @Input() maxItems = 5;

  avgRating = 0;
  ratingDistribution: { [key: string]: number } = {
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0
  };
  displayedReviews: Review[] = [];

  constructor() { }

  ngOnInit(): void {
    this.processReviews();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reviews']) {
      console.log('Review list received reviews:', this.reviews);
      this.processReviews();
    }
  }

  processReviews(): void {
    // Make sure reviews is an array
    if (!this.reviews || !Array.isArray(this.reviews)) {
      console.warn('Reviews is not an array:', this.reviews);
      this.reviews = [];
    }

    // Calculate displayed reviews
    this.displayedReviews = this.reviews.slice(0, this.maxItems);

    // Only calculate stats if we have reviews
    if (this.reviews.length > 0) {
      // Calculate average rating
      const totalStars = this.reviews.reduce((sum, review) => sum + +review.numberOfStars, 0);
      this.avgRating = totalStars / this.reviews.length;

      // Calculate rating distribution
      this.ratingDistribution = {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0
      };

      this.reviews.forEach(review => {
        const stars = review.numberOfStars.toString();
        if (Object.prototype.hasOwnProperty.call(this.ratingDistribution, stars)) {
          this.ratingDistribution[stars]++;
        }
      });
    } else {
      this.avgRating = 0;
      this.ratingDistribution = {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0
      };
    }

    console.log('Processed reviews:', {
      total: this.reviews.length,
      displayed: this.displayedReviews.length,
      avgRating: this.avgRating,
      distribution: this.ratingDistribution
    });
  }

  getRatingPercentage(star: string): number {
    if (!this.reviews || this.reviews.length === 0) {
      return 0;
    }
    return (this.ratingDistribution[star] / this.reviews.length) * 100;
  }
}
