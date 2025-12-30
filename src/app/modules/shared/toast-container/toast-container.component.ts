import { Component, TemplateRef } from '@angular/core';
import { ToastService } from '../../../services/toast.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-toast-container',
  standalone: false,
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss'
})
export class ToastContainerComponent {

  constructor(public toastService: ToastService){}

  isTemplate(toast: any): boolean {
    return toast.textOrTpl instanceof TemplateRef;
  }

  asTemplateRef(value: string | TemplateRef<any>): TemplateRef<any> | null {
    return value instanceof TemplateRef ? value : null;
  }
}
