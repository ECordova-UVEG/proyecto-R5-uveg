import { CurrencyFormatPipe } from './currency-format.pipe';
import { TestBed } from '@angular/core/testing';
import { CurrencyPipe } from '@angular/common';

describe('CurrencyFormatPipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CurrencyPipe]
    });
  });

  it('create an instance', () => {
    const currencyPipe = TestBed.inject(CurrencyPipe);
    const pipe = new CurrencyFormatPipe(currencyPipe);
    expect(pipe).toBeTruthy();
  });
});
