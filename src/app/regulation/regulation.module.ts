import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegulationComponent } from './regulation.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router';
const routes: Routes = [{ path: '', component: RegulationComponent }];


@NgModule({
  declarations: [RegulationComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild(routes)
  ]
})
export class RegulationModule {}
