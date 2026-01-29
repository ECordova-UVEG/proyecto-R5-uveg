import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastState } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  @Input() state: ToastState | null = null;

  get backgroundColor() {
    if (!this.state) return '';
    return this.state.type === 'success' ? 'bg-green-500' : 'bg-red-500';
  }
}