import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { VoucherService, Voucher } from '../../voucher.service';
import { SendVoucherDialogComponent } from './send-voucher-dialog/send-voucher-dialog.component';

@Component({
  selector: 'app-gift-vouchers',
  templateUrl: './gift-vouchers.component.html',
  styleUrls: ['./gift-vouchers.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTabsModule,
    MatDialogModule,
    MatSelectModule,
    ClipboardModule,
    DatePipe
  ],
  providers: [DatePipe]
})
export class GiftVouchersComponent implements OnInit {
  isLoading = false;
  loadingVouchers = false;
  redeemLoading = false;
  purchaseForm: FormGroup;
  vouchers: Voucher[] = [];
  predefinedAmounts = [50, 100, 150, 200, 500];
  voucherCodeInput = new FormControl('', [Validators.required, Validators.pattern(/^GIFT-[A-Z0-9]+$/)]);
  customAmountControl = new FormControl(null);
  
  constructor(
    private fb: FormBuilder,
    private voucherService: VoucherService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.purchaseForm = this.fb.group({
      amount: [100, [Validators.required, Validators.min(10), Validators.max(1000)]],
    });
    
    // Subscribe to changes in customAmountControl
    this.customAmountControl.valueChanges.subscribe(value => {
      if (value) {
        this.purchaseForm.patchValue({ amount: value });
      }
    });
  }

  ngOnInit(): void {
    this.loadUserVouchers();
  }

  loadUserVouchers(): void {
    this.loadingVouchers = true;
    
    // Use the voucher service to load vouchers from backend
    this.voucherService.getUserVouchers().subscribe({
      next: (vouchers) => {
        this.vouchers = vouchers;
        this.loadingVouchers = false;
      },
      error: (error) => {
        console.error('Error loading vouchers:', error);
        this.loadingVouchers = false;
        this.snackBar.open('Failed to load vouchers. Please try again later.', 'Close', {
          duration: 5000
        });
      }
    });
  }

  onAmountSelect(amount: number): void {
    this.purchaseForm.patchValue({ 
      amount: amount
    });
    this.customAmountControl.setValue(null);
  }

  onCustomAmountChange(): void {
    const customAmount = this.customAmountControl.value;
    if (customAmount) {
      this.purchaseForm.patchValue({ amount: customAmount });
    }
  }

  purchaseVoucher(): void {
    if (this.purchaseForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    const amount = this.purchaseForm.get('amount')?.value;
    
    // Call the backend API
    this.voucherService.purchaseVoucher({
      amount: amount,
      currencyCode: 'PLN'
    }).subscribe({
      next: (voucher: Voucher) => {
        this.snackBar.open(`Gift voucher successfully purchased for ${amount} PLN!`, 'Close', {
          duration: 5000
        });
        
        this.vouchers.unshift(voucher); // Add to the beginning of the list
        this.purchaseForm.reset({amount: 100}); // Reset form
        this.customAmountControl.setValue(null);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error purchasing voucher:', error);
        this.snackBar.open('Failed to purchase voucher. Please try again later.', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  copyVoucherCode(code: string): void {
    // ClipboardModule will handle the copy
    this.snackBar.open('Voucher code copied to clipboard!', 'Close', {
      duration: 3000
    });
  }

  sendVoucher(voucher: Voucher): void {
    const dialogRef = this.dialog.open(SendVoucherDialogComponent, {
      width: '500px',
      data: { voucher }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // When backend is ready, use this:
        /*
        this.voucherService.sendVoucher({
          voucherId: voucher.id!,
          recipientEmail: result.email,
          recipientName: result.name,
          message: result.message
        }).subscribe({
          next: (updatedVoucher) => {
            // Update the voucher in the list
            const index = this.vouchers.findIndex(v => v.id === updatedVoucher.id);
            if (index !== -1) {
              this.vouchers[index] = updatedVoucher;
            }
            
            this.snackBar.open('Voucher sent successfully!', 'Close', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Error sending voucher:', error);
            this.snackBar.open('Failed to send voucher. Please try again later.', 'Close', {
              duration: 5000
            });
          }
        });
        */

        // For demo purposes, update the local voucher
        const index = this.vouchers.findIndex(v => v.id === voucher.id);
        if (index !== -1) {
          const updatedVoucher = { ...this.vouchers[index] };
          updatedVoucher.sentTo = result.email;
          updatedVoucher.sentAt = new Date().toISOString();
          
          // Save the updated voucher to localStorage
          this.voucherService.updateVoucher(updatedVoucher).subscribe({
            next: (updated) => {
              this.vouchers[index] = updated;
              this.snackBar.open('Voucher sent successfully!', 'Close', {
                duration: 3000
              });
            }
          });
        }
      }
    });
  }

  getVoucherStatus(voucher: Voucher): { text: string, color: string } {
    if (voucher.status === 'expired') {
      return { text: 'Expired', color: '#999' };
    } else if (voucher.status === 'used') {
      return { text: 'Used', color: '#f44336' };
    } else if (voucher.sentTo) {
      return { text: 'Sent', color: '#2196f3' };
    } else {
      return { text: 'Active', color: '#4caf50' };
    }
  }

  getRemainingDays(expiresAt: string): number {
    const today = new Date();
    const expiryDate = new Date(expiresAt);
    const timeDiff = expiryDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  isExpired(voucher: Voucher): boolean {
    return voucher.status === 'expired' || new Date(voucher.expiresAt) < new Date();
  }

  redeemVoucher(): void {
    if (this.voucherCodeInput.invalid) {
      return;
    }
    
    const voucherCode = this.voucherCodeInput.value || '';
    
    // First check if this voucher code already exists in the user's vouchers
    const existingVoucher = this.vouchers.find(v => v.code === voucherCode);
    if (existingVoucher) {
      this.snackBar.open('You already have this voucher in your account!', 'Close', {
        duration: 5000
      });
      return;
    }
    
    this.redeemLoading = true;
    
    // Call the API to redeem the voucher
    this.voucherService.redeemVoucher({ code: voucherCode }).subscribe({
      next: (response) => {
        this.redeemLoading = false;
        
        if (response.success && response.voucher) {
          // API redemption was successful
          this.vouchers.unshift(response.voucher);
          this.voucherCodeInput.reset();
          
          this.snackBar.open(`Voucher redeemed successfully! Added ${response.amount} PLN to your account.`, 'Close', {
            duration: 5000
          });
        } else {
          // API returned success: false
          const errorMessage = response.error || 'Failed to redeem voucher. Please try a different code.';
          
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000
          });
        }
      },
      error: (error: any) => {
        this.redeemLoading = false;
        console.error('Error redeeming voucher:', error);
        
        // Handle specific error for "already own this voucher"
        if (error.error && (
            error.error.includes("already belongs to this user") || 
            error.error.includes("already own this voucher")
        )) {
          this.snackBar.open('You already own this voucher!', 'Close', {
            duration: 5000
          });
        } else {
          this.snackBar.open('Failed to redeem voucher. Please try again later.', 'Close', {
            duration: 5000
          });
        }
      }
    });
  }
} 