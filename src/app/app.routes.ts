import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guard/auth.guard';
import {EventDetailsComponent} from "./event-details/event-details.component";


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

  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfileModule),
    canActivate: [AuthGuard], // Require authentication for all profile routes
  },

  {
    path: 'artists',
    loadChildren: () =>
      import('./artists/artists.module').then((m) => m.ArtistModule),
    canActivate: [AuthGuard], // Require authentication for all profile routes
  },

  {
    path: 'regulation',
    loadChildren: () =>
      import('./regulation/regulation.module').then((m) => m.RegulationModule),
  },

  {
    path: 'faq',
    loadChildren: () =>
      import('./faq/faq.module').then((m) => m.FaqModule),
  },

  // Default route redirects to the login page
  { path: '', redirectTo: '/doctors', pathMatch: 'full' },

  // { path: 'regulations', component: RegulationsComponent },
  // { path: 'faq', component: FaqComponent }
];
