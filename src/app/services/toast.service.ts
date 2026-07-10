import { Injectable } from '@angular/core';

export type NotificationVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type NotificationAnnouncement = 'polite' | 'assertive';

export interface ToastOptions {
  title?: string;
  duplicateKey?: string;
  duration?: number;
  persistent?: boolean;
  announcement?: NotificationAnnouncement;
}

export interface Toast {
  id: string;
  message: string;
  title?: string;
  variant: NotificationVariant;
  duplicateKey: string;
  duration: number | null;
  persistent: boolean;
  announcement: NotificationAnnouncement;
  createdAt: number;
  isPaused: boolean;
}

interface ToastTimer {
  handle: ReturnType<typeof setTimeout>;
  startedAt: number;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  static readonly MAX_VISIBLE = 4;
  static readonly DUPLICATE_WINDOW = 2000;

  private visibleToasts: Toast[] = [];
  private queuedToasts: Toast[] = [];
  private readonly timers = new Map<string, ToastTimer>();
  private readonly pauseReasons = new Map<string, Set<'hover' | 'focus' | 'manual'>>();
  private readonly recentDuplicates = new Map<string, number>();
  private idSequence = 0;

  get toasts(): readonly Toast[] {
    return this.visibleToasts;
  }

  success(message: string, options: ToastOptions = {}): string | null {
    return this.enqueue(message, 'success', options);
  }

  error(message: string, options: ToastOptions = {}): string | null {
    return this.enqueue(message, 'error', options);
  }

  warning(message: string, options: ToastOptions = {}): string | null {
    return this.enqueue(message, 'warning', options);
  }

  info(message: string, options: ToastOptions = {}): string | null {
    return this.enqueue(message, 'info', options);
  }

  neutral(message: string, options: ToastOptions = {}): string | null {
    return this.enqueue(message, 'neutral', options);
  }

  dismiss(toastId: string): void {
    const visibleToast = this.visibleToasts.find(toast => toast.id === toastId);
    if (visibleToast) {
      this.clearTimer(toastId);
      this.pauseReasons.delete(toastId);
      this.visibleToasts = this.visibleToasts.filter(toast => toast.id !== toastId);
      this.promoteQueued();
      return;
    }

    this.queuedToasts = this.queuedToasts.filter(toast => toast.id !== toastId);
  }

  pause(toastId: string, reason: 'hover' | 'focus' | 'manual' = 'manual'): void {
    const reasons = this.pauseReasons.get(toastId) ?? new Set<'hover' | 'focus' | 'manual'>();
    reasons.add(reason);
    this.pauseReasons.set(toastId, reasons);

    const timer = this.timers.get(toastId);
    if (!timer) return;

    clearTimeout(timer.handle);
    this.timers.delete(toastId);
    const remaining = Math.max(0, timer.startedAt + timer.duration - Date.now());
    this.updatePauseState(toastId, true, remaining);
  }

  resume(toastId: string, reason: 'hover' | 'focus' | 'manual' = 'manual'): void {
    const reasons = this.pauseReasons.get(toastId);
    reasons?.delete(reason);
    if (reasons?.size) return;
    this.pauseReasons.delete(toastId);

    const toast = this.visibleToasts.find(item => item.id === toastId);
    if (!toast || toast.persistent || this.timers.has(toastId)) return;

    const remaining = toast.duration ?? 0;
    if (remaining <= 0) {
      this.dismiss(toastId);
      return;
    }

    this.updatePauseState(toastId, false, remaining);
    this.schedule(toast, remaining);
  }

  clear(): void {
    this.timers.forEach(timer => clearTimeout(timer.handle));
    this.timers.clear();
    this.pauseReasons.clear();
    this.recentDuplicates.clear();
    this.visibleToasts = [];
    this.queuedToasts = [];
  }

  private enqueue(message: string, variant: NotificationVariant, options: ToastOptions): string | null {
    const now = Date.now();
    this.pruneDuplicateHistory(now);

    const duplicateKey = options.duplicateKey?.trim() || `${ variant }|${ this.normalize(options.title ?? '') }|${ this.normalize(message) }`;
    const lastShownAt = this.recentDuplicates.get(duplicateKey);
    if (lastShownAt !== undefined && now - lastShownAt < ToastService.DUPLICATE_WINDOW) {
      return null;
    }

    this.recentDuplicates.set(duplicateKey, now);

    const persistent = options.persistent === true;
    const duration = persistent
      ? null
      : Math.max(0, options.duration ?? this.defaultDuration(variant));
    const toast: Toast = {
      id: `toast-${ now }-${ ++this.idSequence }`,
      message,
      title: options.title?.trim() || undefined,
      variant,
      duplicateKey,
      duration,
      persistent,
      announcement: options.announcement ?? 'polite',
      createdAt: now,
      isPaused: false
    };

    if (this.visibleToasts.length < ToastService.MAX_VISIBLE) {
      this.visibleToasts = [ ...this.visibleToasts, toast ];
      this.schedule(toast);
    } else {
      this.queuedToasts = [ ...this.queuedToasts, toast ];
    }

    return toast.id;
  }

  private schedule(toast: Toast, duration = toast.duration ?? 0): void {
    if (toast.persistent) return;

    const startedAt = Date.now();
    const handle = setTimeout(() => this.dismiss(toast.id), duration);
    this.timers.set(toast.id, { handle, startedAt, duration });
  }

  private promoteQueued(): void {
    while (this.visibleToasts.length < ToastService.MAX_VISIBLE && this.queuedToasts.length) {
      const next = this.queuedToasts.shift();
      if (!next) return;
      this.visibleToasts = [ ...this.visibleToasts, { ...next, isPaused: false } ];
      this.schedule(next);
    }
  }

  private clearTimer(toastId: string): void {
    const timer = this.timers.get(toastId);
    if (!timer) return;
    clearTimeout(timer.handle);
    this.timers.delete(toastId);
  }

  private updatePauseState(toastId: string, isPaused: boolean, duration: number): void {
    this.visibleToasts = this.visibleToasts.map(toast => toast.id === toastId
      ? { ...toast, isPaused, duration: toast.persistent ? null : duration }
      : toast);
  }

  private normalize(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  private pruneDuplicateHistory(now: number): void {
    this.recentDuplicates.forEach((timestamp, key) => {
      if (now - timestamp >= ToastService.DUPLICATE_WINDOW) this.recentDuplicates.delete(key);
    });
  }

  private defaultDuration(variant: NotificationVariant): number {
    switch (variant) {
      case 'success': return 4000;
      case 'warning': return 7000;
      case 'error': return 8000;
      case 'info':
      case 'neutral':
      default: return 5000;
    }
  }
}
