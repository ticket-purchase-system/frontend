import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileRoutingModule } from './profile-routing.module';
import { RecommendedEventsComponent } from './recommended-events/recommended-events.component';
import { GiftVouchersComponent } from './gift-vouchers/gift-vouchers.component';
import { SendVoucherDialogComponent } from './gift-vouchers/send-voucher-dialog/send-voucher-dialog.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProfileRoutingModule,
    RecommendedEventsComponent,
    GiftVouchersComponent,
    SendVoucherDialogComponent
  ]
})
export class ProfileModule { } 