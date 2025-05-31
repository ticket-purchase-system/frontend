import {CommonModule, CurrencyPipe, DatePipe} from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {RouterLink, RouterModule} from '@angular/router';
import {FavoritesComponent} from "./favorites.component";

@NgModule({
  declarations: [FavoritesComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    DatePipe,
    CurrencyPipe,
    RouterLink,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: FavoritesComponent }])
  ]
})
export class FavoritesModule {}
