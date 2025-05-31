import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { httpHelper } from '../utils/HttpHelper';
import { Subject, takeUntil } from 'rxjs';

interface PhotoUploadData {
  eventId: number;
  eventTitle: string;
}

interface UploadProgress {
  file: File;
  caption: string;
  progress: number;
  uploaded: boolean;
  error?: string;
  preview?: string;
  id: string; // Add unique identifier
}

@Component({
  selector: 'app-photo-upload-dialog',
  template: `
    <div class="photo-upload-dialog">
      <h2 mat-dialog-title>
        <mat-icon>add_photo_alternate</mat-icon>
        Upload Photos for {{ data.eventTitle }}
      </h2>

      <mat-dialog-content>
        <!-- File Drop Zone -->
        <div class="file-drop-zone"
             [class.dragover]="isDragOver"
             (dragover)="onDragOver($event)"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)"
             (click)="fileInput.click()">
          <mat-icon>cloud_upload</mat-icon>
          <p>Drop photos here or click to select</p>
          <p class="file-info">Supports: JPG, PNG, GIF, WebP (Max 5MB each)</p>
        </div>

        <input #fileInput
               type="file"
               multiple
               accept="image/jpeg,image/png,image/gif,image/webp"
               (change)="onFileSelect($event)"
               style="display: none;">

        <!-- Selected Files Preview -->
        <div class="selected-files" *ngIf="selectedFiles.length > 0">
          <h3>Selected Photos ({{ selectedFiles.length }})</h3>

          <!-- Upload All Button -->
          <div class="upload-controls" *ngIf="!uploadComplete && selectedFiles.length > 0">
            <button mat-raised-button
                    color="primary"
                    (click)="uploadPhotos()"
                    [disabled]="selectedFiles.length === 0 || uploading">
              <mat-icon>cloud_upload</mat-icon>
              {{ uploading ? 'Uploading...' : 'Upload All Photos' }}
            </button>
          </div>

          <div class="file-list">
            <div class="file-item"
                 *ngFor="let item of selectedFiles; let i = index; trackBy: trackByFileId">
              <div class="file-preview">
                <img [src]="item.preview"
                     *ngIf="item.preview"
                     alt="Preview"
                     (error)="onImageError(item)">
                <div class="file-info-text">
                  <strong>{{ item.file.name }}</strong>
                  <span class="file-size">{{ formatFileSize(item.file.size) }}</span>
                  <span class="file-type" *ngIf="!isValidFileType(item.file)">
                    ⚠️ Unsupported file type
                  </span>
                  <span class="file-size-warning" *ngIf="isFileTooLarge(item.file)">
                    ⚠️ File too large (max 5MB)
                  </span>
                </div>
              </div>

              <mat-form-field class="caption-field" appearance="outline">
                <mat-label>Caption (optional)</mat-label>
                <input matInput
                       [(ngModel)]="item.caption"
                       maxlength="500"
                       placeholder="Add a caption for this photo...">
                <mat-hint>{{ item.caption?.length || 0 }}/500</mat-hint>
              </mat-form-field>

              <div class="file-actions">
                <button mat-icon-button
                        color="warn"
                        (click)="removeFile(i)"
                        [disabled]="uploading"
                        matTooltip="Remove photo">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>

              <!-- Upload Progress -->
              <div class="upload-progress" *ngIf="item.progress > 0 && !item.uploaded">
                <mat-progress-bar
                  mode="determinate"
                  [value]="item.progress">
                </mat-progress-bar>
                <span class="progress-text">
                  Uploading... {{ item.progress }}%
                </span>
              </div>

              <!-- Success State -->
              <div class="upload-success" *ngIf="item.uploaded && !item.error">
                <mat-icon color="primary">check_circle</mat-icon>
                <span>Uploaded successfully</span>
              </div>

              <!-- Error Message -->
              <div class="error-message" *ngIf="item.error">
                <mat-icon color="warn">error</mat-icon>
                <span>{{ item.error }}</span>
                <button mat-button
                        color="primary"
                        size="small"
                        (click)="retryUpload(item)"
                        *ngIf="!uploading">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Summary -->
        <div class="upload-summary" *ngIf="uploadComplete && selectedFiles.length > 0">
          <div class="summary-success" *ngIf="successCount > 0">
            <mat-icon color="primary">check_circle</mat-icon>
            <span>{{ successCount }} photo(s) uploaded successfully</span>
          </div>
          <div class="summary-errors" *ngIf="errorCount > 0">
            <mat-icon color="warn">error</mat-icon>
            <span>{{ errorCount }} photo(s) failed to upload</span>
          </div>
        </div>

        <!-- Overall Progress -->
        <div class="overall-progress" *ngIf="uploading">
          <mat-progress-bar mode="determinate" [value]="overallProgress"></mat-progress-bar>
          <span class="progress-text">
            Uploading {{ currentUploadIndex + 1 }} of {{ selectedFiles.length }}
          </span>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button
                mat-dialog-close
                [disabled]="uploading">
          {{ uploadComplete ? 'Close' : 'Cancel' }}
        </button>
        <button mat-raised-button
                color="primary"
                (click)="uploadPhotos()"
                [disabled]="selectedFiles.length === 0 || uploading || !hasValidFiles()"
                *ngIf="!uploadComplete">
          <mat-icon>cloud_upload</mat-icon>
          {{ uploading ? 'Uploading...' : 'Upload Photos' }}
        </button>
        <button mat-raised-button
                color="accent"
                (click)="uploadFailedPhotos()"
                [disabled]="uploading"
                *ngIf="uploadComplete && errorCount > 0">
          <mat-icon>refresh</mat-icon>
          Retry Failed Uploads
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .photo-upload-dialog {
      width: 90vw;
      max-width: 800px;
      max-height: 90vh;
    }

    .file-drop-zone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 20px;
    }

    .file-drop-zone:hover,
    .file-drop-zone.dragover {
      border-color: #3f51b5;
      background-color: #f5f5f5;
    }

    .file-drop-zone mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #666;
      margin-bottom: 10px;
    }

    .file-info {
      font-size: 12px;
      color: #666;
      margin-top: 8px;
    }

    .selected-files h3 {
      margin-bottom: 16px;
      color: #333;
    }

    .upload-controls {
      margin-bottom: 16px;
      text-align: center;
    }

    .file-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-height: 400px;
      overflow-y: auto;
    }

    .file-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      background-color: #fafafa;
      position: relative;
    }

    .file-item.uploading {
      border-color: #3f51b5;
    }

    .file-item.success {
      border-color: #4caf50;
    }

    .file-item.error {
      border-color: #f44336;
    }

    .file-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .file-preview img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .file-info-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex-grow: 1;
    }

    .file-size {
      font-size: 12px;
      color: #666;
    }

    .file-type,
    .file-size-warning {
      font-size: 12px;
      color: #f44336;
      font-weight: 500;
    }

    .caption-field {
      width: 100%;
      margin-bottom: 12px;
    }

    .file-actions {
      display: flex;
      justify-content: flex-end;
      position: absolute;
      top: 16px;
      right: 16px;
    }

    .upload-progress {
      margin-top: 12px;
    }

    .upload-success {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      color: #4caf50;
      font-size: 14px;
    }

    .progress-text {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
      display: block;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      color: #f44336;
      font-size: 14px;
    }

    .upload-summary {
      margin-top: 16px;
      padding: 12px;
      border-radius: 4px;
      background-color: #f5f5f5;
    }

    .summary-success,
    .summary-errors {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .summary-success:last-child,
    .summary-errors:last-child {
      margin-bottom: 0;
    }

    .overall-progress {
      margin-top: 20px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule
  ]
})
export class PhotoUploadDialogComponent implements OnInit, OnDestroy {
  selectedFiles: UploadProgress[] = [];
  isDragOver = false;
  uploading = false;
  uploadComplete = false;
  successCount = 0;
  errorCount = 0;
  overallProgress = 0;
  currentUploadIndex = 0;

  private destroy$ = new Subject<void>();
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PhotoUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PhotoUploadData
  ) {}

  ngOnInit(): void {
    // Prevent dialog from closing on backdrop click during upload
    this.dialogRef.disableClose = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up object URLs to prevent memory leaks
    this.selectedFiles.forEach(file => {
      if (file.preview && file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
    });
  }

  trackByFileId(index: number, item: UploadProgress): string {
    return item.id;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = Array.from(event.dataTransfer?.files || []);
    this.processFiles(files);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.processFiles(files);
    input.value = '';
  }

  processFiles(files: File[]): void {
    const validFiles = files.filter(file => this.isValidFile(file));

    if (validFiles.length !== files.length) {
      const invalidCount = files.length - validFiles.length;
      this.snackBar.open(
        `${invalidCount} file(s) were skipped (invalid type or too large)`,
        'Close',
        { duration: 3000 }
      );
    }

    validFiles.forEach(file => {
      // Check for duplicates
      const isDuplicate = this.selectedFiles.some(item =>
        item.file.name === file.name &&
        item.file.size === file.size &&
        item.file.lastModified === file.lastModified
      );

      if (!isDuplicate) {
        const uploadItem: UploadProgress = {
          file,
          caption: '',
          progress: 0,
          uploaded: false,
          id: this.generateFileId(file)
        };

        // Create preview
        this.createFilePreview(uploadItem);
        this.selectedFiles.push(uploadItem);
      }
    });
  }

  private generateFileId(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}-${Date.now()}`;
  }

  private createFilePreview(uploadItem: UploadProgress): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadItem.preview = e.target?.result as string;
    };
    reader.onerror = () => {
      uploadItem.error = 'Failed to create preview';
    };
    reader.readAsDataURL(uploadItem.file);
  }

  private isValidFile(file: File): boolean {
    return this.isValidFileType(file) && !this.isFileTooLarge(file);
  }

  isValidFileType(file: File): boolean {
    return this.ALLOWED_TYPES.includes(file.type);
  }

  isFileTooLarge(file: File): boolean {
    return file.size > this.MAX_FILE_SIZE;
  }

  hasValidFiles(): boolean {
    return this.selectedFiles.some(item => this.isValidFile(item.file));
  }

  onImageError(item: UploadProgress): void {
    item.preview = undefined;
  }

  removeFile(index: number): void {
    const file = this.selectedFiles[index];
    if (file.preview && file.preview.startsWith('blob:')) {
      URL.revokeObjectURL(file.preview);
    }
    this.selectedFiles.splice(index, 1);
  }

  uploadPhotos(): void {
    if (this.selectedFiles.length === 0 || !this.hasValidFiles()) return;

    this.dialogRef.disableClose = true;
    this.uploading = true;
    this.uploadComplete = false;
    this.successCount = 0;
    this.errorCount = 0;
    this.currentUploadIndex = 0;

    // Reset all file states
    this.selectedFiles.forEach(item => {
      item.progress = 0;
      item.uploaded = false;
      item.error = undefined;
    });

    this.uploadFilesSequentially();
  }

  private uploadFilesSequentially(): void {
    const validFiles = this.selectedFiles.filter(item => this.isValidFile(item.file));

    if (this.currentUploadIndex >= validFiles.length) {
      this.completeUpload();
      return;
    }

    const currentFile = validFiles[this.currentUploadIndex];
    this.uploadSingleFile(currentFile).then(() => {
      this.currentUploadIndex++;
      this.overallProgress = Math.round((this.currentUploadIndex / validFiles.length) * 100);
      this.uploadFilesSequentially();
    });
  }

  private uploadSingleFile(uploadItem: UploadProgress): Promise<void> {
    return new Promise((resolve) => {
      const formData = new FormData();
      formData.append('photo', uploadItem.file);
      formData.append('caption', uploadItem.caption || '');

      const url = `${environment.apiUrl}/events/${this.data.eventId}/upload_photo/`;

      this.http.post(url, formData, {
        headers: httpHelper.getAuthHeaders(),
        reportProgress: true,
        observe: 'events'
      }).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            uploadItem.progress = Math.round(100 * (event.loaded / (event.total || 1)));
          } else if (event.type === HttpEventType.Response) {
            uploadItem.progress = 100;
            uploadItem.uploaded = true;
            this.successCount++;
            resolve();
          }
        },
        error: (error: HttpErrorResponse) => {
          uploadItem.error = this.getErrorMessage(error);
          uploadItem.uploaded = false;
          this.errorCount++;
          resolve();
        }
      });
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 413) {
      return 'File too large';
    } else if (error.status === 415) {
      return 'Unsupported file type';
    } else if (error.status === 0) {
      return 'Network error';
    } else if (error.error?.message) {
      return error.error.message;
    }
    return 'Upload failed';
  }

  retryUpload(uploadItem: UploadProgress): void {
    uploadItem.error = undefined;
    uploadItem.progress = 0;
    uploadItem.uploaded = false;

    this.uploadSingleFile(uploadItem);
  }

  uploadFailedPhotos(): void {
    const failedFiles = this.selectedFiles.filter(item => item.error);
    if (failedFiles.length === 0) return;

    this.uploading = true;
    this.uploadComplete = false;

    failedFiles.forEach(item => {
      item.error = undefined;
      item.progress = 0;
      item.uploaded = false;
    });

    // Reset counters for failed uploads only
    const previousSuccessCount = this.successCount;
    this.successCount = 0;
    this.errorCount = 0;

    Promise.all(failedFiles.map(item => this.uploadSingleFile(item)))
      .then(() => {
        this.successCount += previousSuccessCount;
        this.completeUpload();
      });
  }

  private completeUpload(): void {
    this.uploading = false;
    this.uploadComplete = true;
    this.dialogRef.disableClose = false;
    this.overallProgress = 100;

    if (this.successCount > 0) {
      this.snackBar.open(
        `${this.successCount} photo(s) uploaded successfully!`,
        'Close',
        { duration: 3000 }
      );

      // Auto-close dialog if all uploads succeeded
      if (this.errorCount === 0) {
        setTimeout(() => {
          this.dialogRef.close({ uploaded: true, count: this.successCount });
        }, 2000);
      }
    }

    if (this.errorCount > 0) {
      this.snackBar.open(
        `${this.errorCount} photo(s) failed to upload`,
        'Close',
        { duration: 5000 }
      );
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
