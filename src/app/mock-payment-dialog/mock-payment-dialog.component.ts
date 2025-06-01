import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoucherService, Voucher } from '../voucher.service';
import { LoyaltyProgramService, LoyaltyProgram } from '../loyalty-program.service';

export interface PaymentDialogData {
  totalAmount: number;
  items: Array<{
    title: string;
    price: number;
    quantity?: number;
  }>;
}

@Component({
  selector: 'app-mock-payment-dialog',
  templateUrl: './mock-payment-dialog.component.html',
  styleUrls: ['./mock-payment-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule
  ]
})
export class MockPaymentDialogComponent implements OnInit {
  isLoading = false;
  isProcessingPayment = false;
  availableVouchers: Voucher[] = [];
  selectedVoucherId: string | null = null;
  
  // Loyalty program related
  loyaltyMembership: LoyaltyProgram | null = null;
  loyaltyDiscount: number = 0;
  
  originalAmount: number = 0;
  voucherDiscount: number = 0;
  finalAmount: number = 0;
  
  paymentCompleted = false;
  loyaltyPointsAwarded = 0;
  tierAdvanced = false;
  newTier = '';

  constructor(
    public dialogRef: MatDialogRef<MockPaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData,
    private voucherService: VoucherService,
    public loyaltyService: LoyaltyProgramService
  ) {
    this.originalAmount = data.totalAmount;
    this.finalAmount = data.totalAmount;
  }

  ngOnInit(): void {
    this.loadAvailableVouchers();
    this.loadLoyaltyMembership();
  }

  loadAvailableVouchers(): void {
    this.isLoading = true;
    this.voucherService.getUserVouchers().subscribe({
      next: (vouchers) => {
        // Only show active vouchers with remaining balance
        this.availableVouchers = vouchers.filter(v => 
          v.status === 'active' && v.amount > 0
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vouchers:', error);
        this.isLoading = false;
      }
    });
  }

  loadLoyaltyMembership(): void {
    this.loyaltyService.getUserMembership().subscribe({
      next: (membership) => {
        this.loyaltyMembership = membership;
        if (membership && membership.is_active) {
          const discountPercentage = this.loyaltyService.getDiscountPercentage(membership.tier);
          this.loyaltyDiscount = (this.originalAmount * discountPercentage) / 100;
          this.calculateFinalAmount();
        }
      },
      error: (error) => {
        console.error('Error loading loyalty membership:', error);
      }
    });
  }

  onVoucherSelected(): void {
    this.calculateFinalAmount();
  }

  calculateFinalAmount(): void {
    let discountedAmount = this.originalAmount - this.loyaltyDiscount;
    
    if (this.selectedVoucherId) {
      const selectedVoucher = this.availableVouchers.find(v => v.id === this.selectedVoucherId);
      if (selectedVoucher) {
        this.voucherDiscount = Math.min(selectedVoucher.amount, discountedAmount);
        discountedAmount -= this.voucherDiscount;
      }
    } else {
      this.voucherDiscount = 0;
    }
    
    this.finalAmount = Math.max(0, discountedAmount);
  }

  processPayment(): void {
    this.isProcessingPayment = true;
    
    // Simulate payment processing delay
    setTimeout(() => {
      // Note: Both voucher application and loyalty points will be handled in close() method when payment is actually completed
      this.paymentCompleted = true;
      this.isProcessingPayment = false;
    }, 2000);
  }

  close(): void {
    // Only apply voucher and award points if payment was successfully processed
    if (this.paymentCompleted) {
      // Apply voucher if selected
      if (this.selectedVoucherId && this.voucherDiscount > 0) {
        const amountAfterLoyaltyDiscount = this.originalAmount - this.loyaltyDiscount;
        this.voucherService.applyVoucher(this.selectedVoucherId, amountAfterLoyaltyDiscount).subscribe({
          next: (result) => {
            if (result.success) {
              console.log('Voucher applied successfully');
            }
          },
          error: (error) => {
            console.error('Error applying voucher:', error);
          }
        });
      }

      // Award loyalty points for the purchase
      this.loyaltyService.awardPoints(this.originalAmount).subscribe({
        next: (result) => {
          if (result) {
            this.loyaltyPointsAwarded = result.points_awarded;
            this.tierAdvanced = result.tier_advanced;
            this.newTier = result.new_tier;
          }
        },
        error: (error) => {
          console.error('Error awarding loyalty points:', error);
        }
      });
    }

    this.dialogRef.close({
      paymentCompleted: this.paymentCompleted,
      voucherUsed: this.paymentCompleted && this.selectedVoucherId ? this.voucherDiscount : 0,
      loyaltyPointsAwarded: this.loyaltyPointsAwarded,
      tierAdvanced: this.tierAdvanced,
      newTier: this.newTier
    });
  }
}
