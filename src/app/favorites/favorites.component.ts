import { Component, OnInit } from '@angular/core';
import {FavoriteService} from "../favorite-service.service";
import {AuthService, User} from "../auth/auth.service";
import {EventService, EventWithDetails} from "../event.service";

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  currentUser: User | null = null;
  events: EventWithDetails[] = [];

  constructor(
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
      if (this.currentUser && this.currentUser.role !== 'admin') {
        this.favoriteService.getUserFavorites(this.currentUser.id).subscribe((favorites) => {
          this.eventService.getEvents().subscribe({
            next: (events) => {
              this.events = events.filter(e => favorites.includes(e ? Number(e.event.id) : -1));
            }
          })
        })
      }
    });
  }

  onRemoveFavorite = (id: number | undefined | string): void => {
    if (this.currentUser && this.currentUser.role !== 'admin' && id) {
      this.favoriteService.removeFavorite(this.currentUser?.id, Number(id)).subscribe({
        next: () => {
          this.events = this.events.filter(e => e.event.id !== id);
          console.log('Unmarked favorite')
        }
      })
    }
  }
}
