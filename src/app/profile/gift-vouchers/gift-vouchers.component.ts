import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  purchaseForm: FormGroup;
  vouchers: Voucher[] = [];
  predefinedAmounts = [50, 100, 150, 200, 500];
  
  constructor(
    private fb: FormBuilder,
    private voucherService: VoucherService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.purchaseForm = this.fb.group({
      amount: [100, [Validators.required, Validators.min(10), Validators.max(1000)]],
      customAmount: [null]
    });
  }

  ngOnInit(): void {
    this.loadUserVouchers();
  }

  loadUserVouchers(): void {
    this.loadingVouchers = true;
    
    // Since we don't have a real backend yet, let's simulate some vouchers
    setTimeout(() => {
      this.simulateVouchers();
      this.loadingVouchers = false;
    }, 1000);
    
    // When backend is ready, use this instead:
    /*
    this.voucherService.getUserVouchers().subscribe({
      next: (vouchers) => {
        this.vouchers = vouchers;
        this.loadingVouchers = false;
      },
      error: (error) => {
        console.error('Error loading vouchers:', error);
        this.loadingVouchers = false;
      }
    });
    */
  }

  simulateVouchers(): void {
    const now = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    
    this.vouchers = [
      {
        id: 'v-1234',
        code: 'GIFT-12345',
        amount: 100,
        initialAmount: 100,
        currencyCode: 'PLN',
        status: 'active',
        createdAt: now.toISOString(),
        expiresAt: sixMonthsLater.toISOString(),
        ownerId: 1
      },
      {
        id: 'v-5678',
        code: 'GIFT-56789',
        amount: 50,
        initialAmount: 50,
        currencyCode: 'PLN',
        status: 'active',
        createdAt: now.toISOString(),
        expiresAt: sixMonthsLater.toISOString(),
        ownerId: 1,
        sentTo: 'friend@example.com',
        sentAt: now.toISOString()
      },
      {
        id: 'v-9012',
        code: 'GIFT-90123',
        amount: 0,
        initialAmount: 200,
        currencyCode: 'PLN',
        status: 'used',
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        expiresAt: new Date(now.getTime() + 150 * 24 * 60 * 60 * 1000).toISOString(), // 150 days from now
        ownerId: 1
      }
    ];
  }

  onAmountSelect(amount: number): void {
    this.purchaseForm.patchValue({ 
      amount: amount,
      customAmount: null
    });
  }

  onCustomAmountChange(): void {
    const customAmount = this.purchaseForm.get('customAmount')?.value;
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
    
    // For demo purposes, let's use the simulate method
    this.voucherService.simulatePurchase(amount).subscribe({
      next: (voucher) => {
        this.snackBar.open(`Gift voucher successfully purchased for ${amount} PLN!`, 'Close', {
          duration: 5000
        });
        
        this.vouchers.unshift(voucher); // Add to the beginning of the list
        this.purchaseForm.reset({amount: 100}); // Reset form
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error purchasing voucher:', error);
        this.snackBar.open('Failed to purchase voucher. Please try again later.', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
    
    // When backend is ready, use this instead:
    /*
    this.voucherService.purchaseVoucher({
      amount: amount,
      currencyCode: 'PLN'
    }).subscribe({
      next: (voucher) => {
        this.snackBar.open(`Gift voucher successfully purchased for ${amount} PLN!`, 'Close', {
          duration: 5000
        });
        
        this.vouchers.unshift(voucher); // Add to the beginning of the list
        this.purchaseForm.reset({amount: 100}); // Reset form
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error purchasing voucher:', error);
        this.snackBar.open('Failed to purchase voucher. Please try again later.', 'Close', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
    */
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

        // For demo purposes, just update the local voucher
        const index = this.vouchers.findIndex(v => v.id === voucher.id);
        if (index !== -1) {
          this.vouchers[index] = {
            ...voucher,
            sentTo: result.email,
            sentAt: new Date().toISOString()
          };
        }
        
        this.snackBar.open('Voucher sent successfully!', 'Close', {
          duration: 3000
        });
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
} 