import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IssuesListComponent } from './issues-list/issues-list.component';
import { ReportIssueComponent } from './report-issue/report-issue.component';
import { LoyaltyProgramComponent } from './loyalty-program/loyalty-program.component';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RecommendedEventsComponent } from './recommended-events/recommended-events.component';
import { GiftVouchersComponent } from './gift-vouchers/gift-vouchers.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'issues',
    pathMatch: 'full'
  },
  {
    path: 'issues',
    component: IssuesListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'report-issue',
    component: ReportIssueComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'loyalty-program',
    component: LoyaltyProgramComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'recommended-events',
    component: RecommendedEventsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'gift-vouchers',
    component: GiftVouchersComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { } 