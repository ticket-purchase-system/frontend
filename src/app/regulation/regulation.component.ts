import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-regulations',
  templateUrl: './regulation.component.html',
  styleUrls: ['./regulation.component.scss'],
})
export class RegulationComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
