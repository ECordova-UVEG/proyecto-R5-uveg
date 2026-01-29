import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {

  constructor(private currencyPipe: CurrencyPipe) {}

  transform(value: number | string | null | undefined, currencyCode: string = 'MXN', display: 'code' | 'symbol' | 'symbol-narrow' | string | boolean = 'symbol', digitsInfo: string = '1.2-2'): string | null {
    return this.currencyPipe.transform(value, currencyCode, display, digitsInfo);
  }

}
