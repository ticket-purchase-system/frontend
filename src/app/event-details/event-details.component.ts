import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { EventDetailsService, EventDetails, EventAttachment } from '../event-details.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatCard, MatCardContent, MatCardHeader} from "@angular/material/card";
import {MatFormField} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatList, MatListItem} from "@angular/material/list";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  standalone: true,
  imports: [
    RouterLink,
    MatProgressSpinner,
    MatCardHeader,
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatIcon,
    MatButton,
    MatListItem,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatList,
    DatePipe,
    MatMenuTrigger
  ],
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {
  eventId: number;
  eventDetails: EventDetails | null = null;
  rulesForm: FormGroup;
  attachmentForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  selectedFile: File | null = null;
  selectedAttachmentFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private eventDetailsService: EventDetailsService,
    private snackBar: MatSnackBar
  ) {
    this.eventId = +this.route.snapshot.paramMap.get('id')!;

    this.rulesForm = this.fb.group({
      rules_text: [''],
      rules_pdf: [null]
    });

    this.attachmentForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      file: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEventDetails();
  }

  loadEventDetails(): void {
    this.isLoading = true;
    this.eventDetailsService.getEventDetails(this.eventId)
      .subscribe({
        next: (data) => {
          this.eventDetails = data;
          this.rulesForm.patchValue({
            rules_text: data.rules_text || ''
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading event details', error);
          this.snackBar.open('Error loading event details', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  onRulesPdfChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];

      if (!this.selectedFile) return;

      if (this.selectedFile.type !== 'application/pdf') {
        this.snackBar.open('Please select a PDF file', 'Close', { duration: 3000 });
        this.selectedFile = null;
        event.target.value = null;
        return;
      }

      if (this.selectedFile.size > 10 * 1024 * 1024) {
        this.snackBar.open('File size cannot exceed 10MB', 'Close', { duration: 3000 });
        this.selectedFile = null;
        event.target.value = null;
        return;
      }
    }
  }

  onAttachmentFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedAttachmentFile = event.target.files[0];

      if (this.selectedAttachmentFile && this.selectedAttachmentFile.size > 10 * 1024 * 1024) {
        this.snackBar.open('File size cannot exceed 10MB', 'Close', { duration: 3000 });
        this.selectedAttachmentFile = null;
        event.target.value = null;
        return;
      }
    }
  }

  saveRules(): void {
    if (!this.eventDetails) return;

    this.isSubmitting = true;
    const formData = new FormData();

    formData.append('rules_text', this.rulesForm.get('rules_text')!.value);

    if (this.selectedFile) {
      formData.append('rules_pdf', this.selectedFile);
    }

    this.eventDetailsService.updateEventDetails(this.eventDetails.id, formData)
      .subscribe({
        next: (data) => {
          this.eventDetails = data;
          this.selectedFile = null;
          this.snackBar.open('Rules updated successfully', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating rules', error);
          this.snackBar.open('Error updating rules', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
  }

  downloadRulesPdf(): void {
    if (!this.eventDetails) return;

    this.eventDetailsService.downloadRulesPdf(this.eventDetails.id)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${this.eventDetails!.event}_rules.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Error downloading rules PDF', error);
          this.snackBar.open('Error downloading rules PDF', 'Close', { duration: 3000 });
        }
      });
  }

  uploadAttachment(): void {
    if (!this.eventDetails || !this.selectedAttachmentFile) return;

    this.isSubmitting = true;
    const formData = this.attachmentForm.value;

    this.eventDetailsService.uploadAttachment(
      this.eventDetails.id,
      formData.title,
      formData.description,
      this.selectedAttachmentFile
    ).subscribe({
      next: (data) => {
        if (this.eventDetails) {
          this.eventDetails.attachments.push(data);
        }

        this.attachmentForm.reset();
        this.selectedAttachmentFile = null;

        this.snackBar.open('Attachment uploaded successfully', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error uploading attachment', error);
        this.snackBar.open('Error uploading attachment', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }

  deleteAttachment(attachment: EventAttachment): void {
    if (confirm(`Are you sure you want to delete "${attachment.title}"?`)) {
      this.eventDetailsService.deleteAttachment(attachment.id)
        .subscribe({
          next: () => {
            if (this.eventDetails) {
              this.eventDetails.attachments = this.eventDetails.attachments.filter(a => a.id !== attachment.id);
            }
            this.snackBar.open('Attachment deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error deleting attachment', error);
            this.snackBar.open('Error deleting attachment', 'Close', { duration: 3000 });
          }
        });
    }
  }

  downloadAttachment(attachment: EventAttachment): void {
    this.eventDetailsService.downloadAttachment(attachment.id)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = attachment.title;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Error downloading attachment', error);
          this.snackBar.open('Error downloading attachment', 'Close', { duration: 3000 });
        }
      });
  }
}
