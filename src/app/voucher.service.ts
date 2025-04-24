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

  constructor(private http: HttpClient) { }

  // Get all vouchers for the current user
  getUserVouchers(): Observable<Voucher[]> {
    return this.http.get<Voucher[]>(`${this.apiUrl}/user`, { headers: httpHelper.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching user vouchers', error);
          return of([]);
        })
      );
  }

  // Purchase a new voucher
  purchaseVoucher(request: VoucherPurchaseRequest): Observable<Voucher> {
    return this.http.post<Voucher>(`${this.apiUrl}/purchase`, request, { headers: httpHelper.getAuthHeaders() });
  }

  // Send a voucher as a gift
  sendVoucher(request: VoucherSendRequest): Observable<Voucher> {
    return this.http.post<Voucher>(`${this.apiUrl}/send`, request, { headers: httpHelper.getAuthHeaders() });
  }

  // Validate a voucher code
  validateVoucher(code: string): Observable<{ valid: boolean, amount?: number }> {
    return this.http.get<Voucher>(`${this.apiUrl}/validate/${code}`, { headers: httpHelper.getAuthHeaders() })
      .pipe(
        map(voucher => ({ valid: true, amount: voucher.amount })),
        catchError(error => {
          console.error('Error validating voucher', error);
          return of({ valid: false });
        })
      );
  }

  // Redeem a voucher
  redeemVoucher(request: VoucherRedeemRequest): Observable<{ success: boolean, amount?: number }> {
    return this.http.post<{ success: boolean, amount?: number }>(`${this.apiUrl}/redeem`, request, { headers: httpHelper.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error redeeming voucher', error);
          return of({ success: false });
        })
      );
  }

  // For demo purposes - simulate voucher purchase response
  simulatePurchase(amount: number): Observable<Voucher> {
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 6); // 6 months validity
    
    const voucher: Voucher = {
      id: 'v-' + Math.floor(Math.random() * 10000),
      code: 'GIFT-' + Math.floor(Math.random() * 100000),
      amount: amount,
      initialAmount: amount,
      currencyCode: 'PLN',
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: expirationDate.toISOString(),
      ownerId: 1 // Assuming current user id is 1
    };
    
    return of(voucher);
  }
} 