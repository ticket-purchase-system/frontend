import { Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

export const routes: Routes = [
  {
    path: 'calendar',
    loadChildren: () =>
      import('./calendar/calendar.module').then((m) => m.CalendarModule),
  },
  { path: '', redirectTo: '/calendar', pathMatch: 'full' },
];
