import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe, DecimalPipe],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss'
})
export class KpiCardComponent {
  @Input() title: string = '';
  @Input() value: number | string | null = null;
  @Input() icon: string = '';
  @Input() showSign: boolean = false;
  @Input() format: 'currency' | 'number' | 'text' = 'currency';

  get isPositive(): boolean {
    if (this.value === null || this.value === '-') return false;
    return Number(this.value) > 0;
  }
}
