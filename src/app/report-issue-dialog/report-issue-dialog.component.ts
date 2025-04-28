import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms'; // Because of [(ngModel)]


@Component({
  selector: 'app-report-issue-dialog',
  templateUrl: './report-issue-dialog.component.html',
  styleUrls: ['./report-issue-dialog.component.scss'],
  standalone: true,
  imports: [
      FormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatDialogModule
    ],
})



export class ReportIssueDialogComponent {
  issueText: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ReportIssueDialogComponent>
  ) {}

  submitReport() {
    console.log('Reported Issue:', this.issueText, 'For event:', this.data.event.title);
    alert('Thank you for reporting the issue!');
    this.dialogRef.close();
  }
}
