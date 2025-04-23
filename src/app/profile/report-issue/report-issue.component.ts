import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TechnicalIssue, TechnicalIssueService } from '../../technical-issue.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-report-issue',
  templateUrl: './report-issue.component.html',
  styleUrl: './report-issue.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class ReportIssueComponent {
  issueForm: FormGroup;
  isSubmitting = false;
  
  priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  constructor(
    private fb: FormBuilder,
    private issueService: TechnicalIssueService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.issueForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      priority: ['medium', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.issueForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const issue: TechnicalIssue = this.issueForm.value;

    this.issueService.createIssue(issue).subscribe({
      next: () => {
        this.snackBar.open('Technical issue reported successfully', 'Close', {
          duration: 3000
        });
        this.router.navigate(['/profile/issues']);
      },
      error: (error) => {
        console.error('Error reporting issue:', error);
        this.snackBar.open('Failed to report issue. Please try again.', 'Close', {
          duration: 3000
        });
        this.isSubmitting = false;
      }
    });
  }
}
