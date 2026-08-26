import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(type: ToastMessage['type'], message: string, title?: string, duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, message, title, duration };

    this._toasts.update((current) => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title = 'Success') {
    this.show('success', message, title);
  }

  error(message: string, title = 'Error') {
    this.show('error', message, title);
  }

  info(message: string, title = 'Info') {
    this.show('info', message, title);
  }

  warning(message: string, title = 'Notice') {
    this.show('warning', message, title);
  }

  remove(id: string) {
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
