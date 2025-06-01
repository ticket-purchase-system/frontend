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
        // Load favorites initially
        this.favoriteService.getUserFavorites(this.currentUser.id).subscribe();
        
        // Subscribe to reactive favorites and events
        this.favoriteService.favorites$.subscribe((favorites) => {
          this.eventService.getEvents().subscribe({
            next: (events) => {
              this.events = events.filter(e => favorites.includes(e ? Number(e.event.id) : -1));
            }
          });
        });
      }
    });
  }

  onRemoveFavorite = (id: number | undefined | string): void => {
    if (this.currentUser && this.currentUser.role !== 'admin' && id) {
      this.favoriteService.removeFavorite(this.currentUser?.id, Number(id)).subscribe({
        next: () => {
          // The reactive state will update automatically, no need to manually filter
          console.log('Unmarked favorite')
        }
      })
    }
  }
}
