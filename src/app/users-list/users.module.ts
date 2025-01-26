import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './users-list.component';
import { MatIconModule } from '@angular/material/icon';


const routes: Routes = [
  { path: '', component: UserListComponent }, // Path for the user list
];

@NgModule({
  declarations: [UserListComponent],
  imports: [CommonModule, 
            RouterModule.forChild(routes), 
            MatIconModule],
})
export class UsersModule {}
