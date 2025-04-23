import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Artist } from '../artist.service';

@Component({
  selector: 'app-artists-dialog',
  templateUrl: './artists-dialog.component.html',
  styleUrls: ['./artists-dialog.component.scss']
})
export class ArtistDialogComponent {
  artistForm: FormGroup;
  dialogTitle: string;
  isEditMode: boolean;

  // Common music genres
  genres: string[] = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country',
    'Electronic', 'Jazz', 'Classical', 'Folk',
    'Metal', 'Blues', 'Reggae', 'Punk', 'Alternative',
    'Indie', 'Soul', 'Funk', 'Disco', 'Techno', 'House'
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ArtistDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      artist?: Artist;
    }
  ) {
    this.dialogTitle = data.title || 'Artist';
    this.isEditMode = !!data.artist;

    this.artistForm = this.fb.group({
      name: [data.artist?.name || '', [Validators.required, Validators.maxLength(100)]],
      genre: [data.artist?.genre || ''],
      bio: [data.artist?.bio || '']
    });
  }

  onSubmit(): void {
    if (this.artistForm.valid) {
      const artistData: Artist = {
        id: this.isEditMode ? this.data.artist!.id : 0, // Backend will assign ID for new artists
        name: this.artistForm.value.name,
        genre: this.artistForm.value.genre,
        bio: this.artistForm.value.bio
      };

      this.dialogRef.close(artistData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
