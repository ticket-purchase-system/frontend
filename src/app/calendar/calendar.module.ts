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
import { AppointmentDialogComponent } from '../appointment-dialog/appointment-dialog.component';
import { BasketComponent } from '../basket/basket.component';
import {AbsenceComponent} from '../absence/absence.component'
import { AppComponent } from '../app.component';

// firebase
import { AngularFireModule } from "@angular/fire/compat";
import { environment } from '../../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

const routes: Routes = [{ path: '', component: CalendarComponent }];

@NgModule({
  declarations: [CalendarComponent, BasketComponent, ],
  imports: [
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AppComponent,
    CommonModule,
    MatButtonModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatIconModule,
    DragDropModule,
    AppointmentDialogComponent,
    RouterModule.forChild(routes),
    AbsenceComponent,
    MatOptionModule, // Import MatOptionModule
    MatSelectModule, // Import MatSelectModule
    ],
})
export class CalendarModule {}
