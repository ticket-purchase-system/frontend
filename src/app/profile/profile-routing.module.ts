import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IssuesListComponent } from './issues-list/issues-list.component';
import { ReportIssueComponent } from './report-issue/report-issue.component';
import { LoyaltyProgramComponent } from './loyalty-program/loyalty-program.component';
import { AuthGuard } from '../auth/guard/auth.guard';

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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { } 