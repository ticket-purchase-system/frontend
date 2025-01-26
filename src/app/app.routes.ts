import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guard/auth.guard';


export const routes: Routes = [
  // Lazy load the Calendar Module
  {
    path: 'calendar',
    loadChildren: () =>
      import('./calendar/calendar.module').then((m) => m.CalendarModule),
  },
  // Lazy load the Auth Module
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.module').then((m) => m.AuthModule),
  },

  {
    path: 'users',
    loadChildren: () =>
      import('./users-list/users.module').then((m) => m.UsersModule),
    // canActivate: [AuthGuard], // Apply the AuthGuard here
  },

  {
    path: 'doctors',
    loadChildren: () =>
      import('./doctors-list/doctors.module').then((m) => m.DoctorsModule),
    // canActivate: [AuthGuard], // Apply the AuthGuard here
  },

  // Default route redirects to the login page
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },


];
