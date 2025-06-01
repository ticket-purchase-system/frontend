import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { httpHelper } from './utils/HttpHelper';

export interface Voucher {
  id?: string;
  code: string;
  amount: number;
  initialAmount: number; // original amount
  currencyCode: string;
  status: 'active' | 'used' | 'expired';
  createdAt: string;
  expiresAt: string;
  ownerId: number;
  sentTo?: string; // email address if sent as a gift
  sentAt?: string; // when it was sent
}

export interface VoucherPurchaseRequest {
  amount: number;
  currencyCode: string;
}

export interface VoucherSendRequest {
  voucherId: string;
  recipientEmail: string;
  recipientName: string;
  message?: string;
}

export interface VoucherRedeemRequest {
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  private apiUrl = `${environment.apiUrl}/vouchers`;

  constructor(private http: HttpClient) {}
  
  // Get user vouchers from API
  getUserVouchers(): Observable<Voucher[]> {
    console.log('Getting vouchers from API...');
    return this.http.get<any[]>(`${this.apiUrl}/user`, { 
      headers: httpHelper.getAuthHeaders() 
    }).pipe(
      map(response => {
        console.log('API response:', response);
        // Transform the backend response to match our frontend model
        return response.map(item => ({
          id: item.id?.toString(),
          code: item.code,
          amount: item.amount,
          initialAmount: item.initial_amount,
          currencyCode: item.currency_code,
          status: item.status,
          createdAt: item.created_at,
          expiresAt: item.expires_at,
          ownerId: item.owner_id,
          sentTo: item.sent_to,
          sentAt: item.sent_at
        }));
      }),
      catchError(error => {
        console.error('Error fetching vouchers from API:', error);
        // Return empty array on error
        return of([]);
      })
    );
  }

  // Purchase a new voucher
  purchaseVoucher(request: VoucherPurchaseRequest): Observable<Voucher> {
    return this.http.post<any>(`${this.apiUrl}/purchase`, {
      amount: request.amount,
      currency_code: request.currencyCode
    }, { 
      headers: httpHelper.getAuthHeaders() 
    }).pipe(
      map(response => ({
        id: response.id?.toString(),
        code: response.code,
        amount: response.amount,
        initialAmount: response.initial_amount,
        currencyCode: response.currency_code,
        status: response.status,
        createdAt: response.created_at,
        expiresAt: response.expires_at,
        ownerId: response.owner_id,
        sentTo: response.sent_to,
        sentAt: response.sent_at
      })),
      catchError(error => {
        console.error('Error purchasing voucher:', error);
        throw error;
      })
    );
  }

  // Send a voucher as a gift
  sendVoucher(request: VoucherSendRequest): Observable<Voucher> {
    return this.http.post<Voucher>(`${this.apiUrl}/${request.voucherId}/send`, {
      recipientEmail: request.recipientEmail,
      recipientName: request.recipientName,
      message: request.message
    }, { 
      headers: httpHelper.getAuthHeaders() 
    }).pipe(
      catchError(error => {
        console.error('Error sending voucher:', error);
        throw error;
      })
    );
  }

  // Validate a voucher code
  validateVoucher(code: string): Observable<{ valid: boolean, amount?: number }> {
    return this.http.get<{ valid: boolean, amount?: number }>(`${this.apiUrl}/validate/${code}`, { 
      headers: httpHelper.getAuthHeaders() 
    }).pipe(
      catchError(error => {
        console.error('Error validating voucher:', error);
        return of({ valid: false });
      })
    );
  }

  // Redeem a voucher
  redeemVoucher(request: VoucherRedeemRequest): Observable<{ success: boolean, amount?: number, voucher?: Voucher, error?: string }> {
    return this.http.post<any>(`${this.apiUrl}/redeem`, request, { 
      headers: httpHelper.getAuthHeaders() 
    }).pipe(
      map(response => {
        if (response.success && response.voucher) {
          return {
            success: true,
            amount: response.amount,
            voucher: {
              id: response.voucher.id?.toString(),
              code: response.voucher.code,
              amount: response.voucher.amount,
              initialAmount: response.voucher.initial_amount,
              currencyCode: response.voucher.currency_code,
              status: response.voucher.status,
              createdAt: response.voucher.created_at,
              expiresAt: response.voucher.expires_at,
              ownerId: response.voucher.owner_id,
              sentTo: response.voucher.sent_to,
              sentAt: response.voucher.sent_at
            }
          };
        } else {
          return {
            success: false,
            error: response.error || 'Failed to redeem voucher'
          };
        }
      }),
      catchError(error => {
        console.error('Error redeeming voucher:', error);
        
        // Extract error message from different possible error response formats
        let errorMessage = 'An error occurred while redeeming the voucher';
        
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (error.error.detail) {
            errorMessage = error.error.detail;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return of({ 
          success: false, 
          error: errorMessage
        });
      })
    );
  }
  
  // Apply a voucher to a purchase
  applyVoucher(voucherId: string, amount: number): Observable<{ success: boolean, amountUsed?: number, remaining?: number }> {
    return this.http.post<any>(`${this.apiUrl}/apply`, {
      voucher_id: parseInt(voucherId),
      amount: amount
    }, { 
      headers: httpHelper.getAuthHeaders() 
    }).pipe(
      catchError(error => {
        console.error('Error applying voucher:', error);
        return of({ success: false });
      })
    );
  }

  // Update a voucher
  updateVoucher(updatedVoucher: Voucher): Observable<Voucher> {
    return this.http.put<Voucher>(`${this.apiUrl}/${updatedVoucher.id}`, updatedVoucher, {
      headers: httpHelper.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error updating voucher:', error);
        throw error;
      })
    );
  }
} 