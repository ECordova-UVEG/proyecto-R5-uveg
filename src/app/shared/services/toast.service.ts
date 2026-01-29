import { Injectable, signal } from '@angular/core';

export interface ToastState {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  public readonly toastState = signal<ToastState | null>(null);

  show(message: string, type: 'success' | 'error') {
    this.toastState.set({ message, type });
    setTimeout(() => this.hide(), 3000); // Auto-hide after 3 seconds
  }

  hide() {
    this.toastState.set(null);
  }
}