import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ArtistService, Artist } from '../artist.service';
import { ArtistDialogComponent } from '../artists-dialog/artists-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-artists-list',
  templateUrl: './artists-list.component.html',
  styleUrls: ['./artists-list.component.scss']
})
export class ArtistListComponent implements OnInit {
  artists: Artist[] = [];
  loading = false;
  displayedColumns: string[] = ['name', 'genre', 'actions'];

  constructor(
    private artistService: ArtistService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists(): void {
    this.loading = true;
    this.artistService.getArtists().subscribe({
      next: (artists: Artist[]) => {
        this.artists = artists;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading artists', error);
        this.snackBar.open('Failed to load artists', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ArtistDialogComponent, {
      width: '500px',
      data: { title: 'Add New Artist' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.artistService.createArtist(result).subscribe({
          next: () => {
            this.snackBar.open('Artist added successfully', 'Close', { duration: 3000 });
            this.loadArtists();
          },
          error: (error: any) => {
            console.error('Error adding artist', error);
            this.snackBar.open('Failed to add artist', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  openEditDialog(artist: Artist): void {
    const dialogRef = this.dialog.open(ArtistDialogComponent, {
      width: '500px',
      data: {
        title: 'Edit Artist',
        artist: artist
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.artistService.updateArtist({...result, id: artist.id}).subscribe({
          next: () => {
            this.snackBar.open('Artist updated successfully', 'Close', { duration: 3000 });
            this.loadArtists();
          },
          error: (error) => {
            console.error('Error updating artist', error);
            this.snackBar.open('Failed to update artist', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteArtist(artist: Artist): void {
    if (confirm(`Are you sure you want to delete ${artist.name}?`)) {
      this.artistService.deleteArtist(artist.id).subscribe({
        next: () => {
          this.snackBar.open('Artist deleted successfully', 'Close', { duration: 3000 });
          this.loadArtists();
        },
        error: (error: any) => {
          console.error('Error deleting artist', error);
          this.snackBar.open('Failed to delete artist', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
