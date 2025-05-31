import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() maxStars: number = 5;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() editable: boolean = false;
  @Input() color: string = '#ff9800';
  @Output() ratingChange = new EventEmitter<number>();

  hoverRating: number | null = null;

  get stars(): number[] {
    return Array(this.maxStars).fill(0).map((_, i) => i + 1);
  }

  getIconSize(): { width: string, height: string, fontSize: string } {
    switch (this.size) {
      case 'small':
        return { width: '16px', height: '16px', fontSize: '16px' };
      case 'large':
        return { width: '32px', height: '32px', fontSize: '32px' };
      default:
        return { width: '24px', height: '24px', fontSize: '24px' };
    }
  }

  getStarIcon(position: number): string {
    const currentRating = this.hoverRating !== null ? this.hoverRating : this.rating;

    if (position <= currentRating) {
      return 'star';
    } else if (position - 0.5 <= currentRating) {
      return 'star_half';
    } else {
      return 'star_border';
    }
  }

  onStarHover(position: number): void {
    if (this.editable) {
      this.hoverRating = position;
    }
  }

  onStarLeave(): void {
    this.hoverRating = null;
  }

  onStarClick(position: number): void {
    if (this.editable) {
      this.rating = position;
      this.ratingChange.emit(this.rating);
    }
  }
}
