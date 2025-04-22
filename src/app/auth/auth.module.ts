import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { NewPasswordComponent } from './newpassword/newpassword.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EditProfileComponent } from './edit-profile/edit-profile.component';




const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'newpassword', component: NewPasswordComponent },
  { path: 'edit-profile', component: EditProfileComponent },
];

@NgModule({
  declarations: [LoginComponent, SignupComponent, NewPasswordComponent, EditProfileComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    HttpClientModule,
    MatSelectModule,
    MatCardModule,
    MatFormFieldModule
  ],
})
export class AuthModule {}
