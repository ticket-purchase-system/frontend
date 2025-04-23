import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TechnicalIssue, TechnicalIssueService } from '../../technical-issue.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-issues-list',
  templateUrl: './issues-list.component.html',
  styleUrl: './issues-list.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule
  ]
})
export class IssuesListComponent implements OnInit {
  issues: TechnicalIssue[] = [];
  displayedColumns: string[] = ['title', 'priority', 'status', 'created_at', 'actions'];
  isLoading = true;
  
  constructor(
    private issueService: TechnicalIssueService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadIssues();
  }

  loadIssues(): void {
    this.isLoading = true;
    this.issueService.getUserIssues().subscribe({
      next: (issues) => {
        this.issues = issues;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching issues:', error);
        this.snackBar.open('Failed to load technical issues', 'Close', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  deleteIssue(id: number): void {
    if (confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      this.issueService.deleteIssue(id).subscribe({
        next: () => {
          this.snackBar.open('Issue deleted successfully', 'Close', {
            duration: 3000
          });
          this.loadIssues(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting issue:', error);
          this.snackBar.open('Failed to delete issue', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      case 'critical': return 'priority-critical';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return '';
    }
  }
}
