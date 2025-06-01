import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from './calendar.component';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { EventDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import { BasketComponent } from '../basket/basket.component';
import {AbsenceComponent} from '../absence/absence.component'
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import {PresenceComponent} from '../presence/presence.component'
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from '../auth/auth.interceptor'; // zmień ścieżkę jeśli inna
import { MockPaymentDialogComponent } from '../mock-payment-dialog/mock-payment-dialog.component';
import { TicketPurchaseDialogComponent } from '../ticket-purchase-dialog/ticket-purchase-dialog.component';
import {EventDetailsComponent} from "../event-details/event-details.component";
import {ReviewListComponent} from "../review-list/review-list.component";

import { FormsModule } from '@angular/forms';



// firebase
import { AngularFireModule } from "@angular/fire/compat";
import { environment } from '../../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";

const routes: Routes = [
  { path: '', component: CalendarComponent },
  { path: 'event/:id', component: EventDetailsComponent }  // Add this nested route
];

@NgModule({
  declarations: [
    CalendarComponent,
    BasketComponent,
    TicketPurchaseDialogComponent
  ],
  imports: [
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    // AppComponent,
    CommonModule,
    MatButtonModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatIconModule,
    DragDropModule,
    EventDialogComponent,
    RouterModule.forChild(routes),
    AbsenceComponent,
    MatOptionModule, // Import MatOptionModule
    MatSelectModule, // Import MatSelectModule
    MatTooltipModule,
    PresenceComponent,
    MatCardModule,
    MatListModule,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    HttpClientModule,
    EventDetailsComponent,
    ReviewListComponent,
    FormsModule,
    MockPaymentDialogComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class CalendarModule {}
