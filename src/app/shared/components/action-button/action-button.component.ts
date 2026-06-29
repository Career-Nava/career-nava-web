import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type ActionButtonVariant = 'primary' | 'neutral' | 'danger' | 'ghost';
export type ActionButtonAppearance = 'icon' | 'pill';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [ CommonModule, RouterLink, FontAwesomeModule ],
  templateUrl: './action-button.component.html'
})
export class ActionButtonComponent {
  @Input() variant: ActionButtonVariant = 'neutral';
  @Input() appearance: ActionButtonAppearance = 'icon';
  @Input() icon: IconDefinition | null = null;
  @Input() label: string | null = null;
  @Input() ariaLabel = '';
  @Input() title: string | null = null;
  @Input() buttonType: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() routerLink: string | any[] | null = null;
  @Input() href: string | null = null;
  @Input() target: string | null = null;
  @Input() rel: string | null = null;
  @Input() extraClass: string | string[] | Record<string, boolean> | null = null;

  @Output() pressed = new EventEmitter<MouseEvent>();

  get isIconOnly(): boolean {
    return this.appearance === 'icon' || !this.label?.trim();
  }

  get effectiveTitle(): string {
    return this.title?.trim() || this.ariaLabel;
  }

  get computedRel(): string | null {
    if (this.rel?.trim()) {
      return this.rel;
    }

    return this.target === '_blank' ? 'noopener noreferrer' : null;
  }

  handlePress(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.pressed.emit(event);
  }
}
