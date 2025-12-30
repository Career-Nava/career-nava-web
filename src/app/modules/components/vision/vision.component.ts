import { NgForOf, NgOptimizedImage } from "@angular/common";
import { Component } from '@angular/core';

@Component({
  selector: 'app-vision',
  standalone: true,
  templateUrl: './vision.component.html',
  imports: [ NgOptimizedImage, NgForOf ],
  styleUrls: [ './vision.component.scss' ]
})
export class VisionComponent {
  beliefs: string[] = [
    "Opportunities surround us every day — we simply need to learn how to recognize them and use them to create value for ourselves and others.",
    "Growth is not achieved by receiving support alone; true impact comes from extending that same support to others.",
    "Africans have the potential to lead on the world’s biggest stages — from Wall Street to global innovation hubs. The world belongs to all of us, not just a select few.",
    "Progress is driven by our own effort, strengthened by the guidance and support of those who have walked the path before us."
  ];

  coreValues: string[] = [ 'Excellence', 'Altruism', 'Engineered Luck' ];
}
