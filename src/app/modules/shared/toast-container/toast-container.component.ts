import { Component } from '@angular/core';
import {
  faBell,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { NotificationVariant, Toast, ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: false,
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss'
})
export class ToastContainerComponent {
  protected readonly faBell = faBell;
  protected readonly faCircleCheck = faCircleCheck;
  protected readonly faCircleExclamation = faCircleExclamation;
  protected readonly faCircleInfo = faCircleInfo;
  protected readonly faTriangleExclamation = faTriangleExclamation;
  protected readonly faXmark = faXmark;

  constructor(public readonly toastService: ToastService) {}

  getVariantLabel(variant: NotificationVariant): string {
    return variant.charAt(0).toUpperCase() + variant.slice(1);
  }

  trackToast(_: number, toast: Toast): string {
    return toast.id;
  }

  onMouseEnter(toast: Toast): void {
    this.toastService.pause(toast.id, 'hover');
  }

  onMouseLeave(toast: Toast): void {
    this.toastService.resume(toast.id, 'hover');
  }

  onFocusIn(toast: Toast): void {
    this.toastService.pause(toast.id, 'focus');
  }

  onFocusOut(event: FocusEvent, toast: Toast, element: HTMLElement): void {
    const nextTarget = event.relatedTarget as Node | null;
    if (!nextTarget || !element.contains(nextTarget)) {
      this.toastService.resume(toast.id, 'focus');
    }
  }
}
