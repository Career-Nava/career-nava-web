import { NgForOf } from "@angular/common";
import { Component, Input } from '@angular/core';

@Component({
  selector: 'card-skeleton',
  standalone: true,
  imports: [ NgForOf ],
  templateUrl: './card-skeleton.component.html',
  styleUrl: './card-skeleton.component.scss'
})
export class CardSkeletonComponent {

  // Number of skeleton cards to show
  @Input() skeletonCount = 3;

  get skeletonArray(): any[] {
    return Array(this.skeletonCount);
  }
}
