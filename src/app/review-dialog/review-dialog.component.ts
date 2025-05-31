import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Order } from '../order-service/order.service';
import {Review} from "../review-service.service";

export interface ReviewDialogData {
  order: Order;
  existingReview?: Review;
}

@Component({
  selector: 'app-review-dialog',
  templateUrl: './review-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  styleUrls: ['./review-dialog.component.scss']
})
export class ReviewDialogComponent {
  reviewForm: FormGroup;
  isEditMode: boolean;
  stars: { value: string, icon: string }[] = [
    { value: '1', icon: 'star' },
    { value: '2', icon: 'star' },
    { value: '3', icon: 'star' },
    { value: '4', icon: 'star' },
    { value: '5', icon: 'star' }
  ];
  selectedRating: number = 5;

  constructor(
    public dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewDialogData,
    private fb: FormBuilder
  ) {
    this.isEditMode = !!data.existingReview;

    this.reviewForm = this.fb.group({
      numberOfStars: [this.isEditMode ? data.existingReview?.numberOfStars : '5', Validators.required],
      comment: [this.isEditMode ? data.existingReview?.comment : '', Validators.required],
      rating: [this.isEditMode ? data.existingReview?.rating : 5, [Validators.required, Validators.min(1), Validators.max(5)]]
    });

    if (this.isEditMode && data.existingReview) {
      this.selectedRating = data.existingReview.rating;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.reviewForm.valid) {
      const reviewData: Review = {
        numberOfStars: this.reviewForm.value.numberOfStars,
        comment: this.reviewForm.value.comment,
        rating: this.reviewForm.value.rating
      };

      this.dialogRef.close(reviewData);
    }
  }

  setRating(value: number): void {
    this.selectedRating = value;
    this.reviewForm.patchValue({
      numberOfStars: value.toString(),
      rating: value
    });
  }

  getStarIcon(index: number): string {
    return index < this.selectedRating ? 'star' : 'star_border';
  }

  getStarColor(index: number): string {
    return index < this.selectedRating ? 'gold' : 'gray';
  }
}
