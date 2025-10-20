import { Injectable, TemplateRef } from '@angular/core';

export interface Toast {
  textOrTpl: string | TemplateRef<any>;
  classname?: string;
  delay?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
toasts: Toast[] = [];

  // show text or template
  show(textOrTpl: string | TemplateRef<any>, options: Partial<Toast> = {}) {
    const toast: Toast = {
      textOrTpl,
      classname: options.classname ?? 'bg-primary text-light',
      delay: options.delay ?? 3000
    };
    this.toasts.push(toast);
  }

  // remove specific toast
  remove(toast: Toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  // clear all
  clear() {
    this.toasts = [];
  }
}
