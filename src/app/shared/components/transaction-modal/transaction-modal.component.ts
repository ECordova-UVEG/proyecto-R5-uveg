import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Investment } from '../../../core/services/data.service';

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-modal.component.html',
})
export class TransactionModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() ticker = '';
  @Input() type: 'BUY' | 'SELL' = 'BUY';

  @Output() close = new EventEmitter<void>();
  @Output() transactionCompleted = new EventEmitter<void>();

  public dataService = inject(DataService);

  // --- Local State ---
  qty: number | null = null;
  price: number | null = null;
  isLoading = false;
  errorMessage = '';
  currentType: 'BUY' | 'SELL' = 'BUY';
  public availableQty: number = 0;
  public estimatedTotal: number = 0;

  get buyingPower(): number {
    return this.dataService.mockData.cashBalance || 0;
  }

  get userAssets(): Investment[] {
    return this.dataService.mockData.assets || [];
  }

  get isFormInvalid(): boolean {
    return !this.ticker || !this.qty || !this.price || this.qty <= 0 || this.price <= 0;
  }

  get hasInsufficientFunds(): boolean {
    return this.currentType === 'BUY' && this.estimatedTotal > this.buyingPower;
  }
  
  get hasInsufficientQty(): boolean {
    return this.currentType === 'SELL' && (this.qty || 0) > this.availableQty;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen'] && this.isOpen) || (changes['ticker'] && this.isOpen)) {
      this.currentType = this.type;
      this.resetForm();
      this.updateMarketData();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  async onSubmit(): Promise<void> {
    if (this.isFormInvalid || this.isLoading || this.hasInsufficientFunds || this.hasInsufficientQty) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.dataService.executeTransaction(this.ticker, this.qty!, this.price!, this.currentType);
      this.transactionCompleted.emit();
      this.onClose();
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  updateMarketData(): void {
    if (!this.ticker) {
      this.price = null;
      this.availableQty = 0;
      this.calculateTotal();
      return;
    }

    const asset = this.dataService.mockData.assets.find(a => a.ticker === this.ticker);
    
    if (asset) {
      this.price = asset.current_price;
      this.availableQty = asset.quantity;
    } else {
      this.price = this.dataService.getMarketPrice(this.ticker) || 150.00;
      this.availableQty = 0;
    }
    
    this.calculateTotal();
  }
  
  calculateTotal(): void {
    this.estimatedTotal = (this.qty || 0) * (this.price || 0);
  }

  setType(t: 'BUY' | 'SELL'): void {
    this.currentType = t;
    this.qty = null;
    this.errorMessage = '';
    if (this.currentType === 'SELL' && !this.userAssets.find(a => a.ticker === this.ticker)) {
      this.ticker = this.userAssets.length > 0 ? this.userAssets[0].ticker : '';
    }
    this.updateMarketData();
  }

  private resetForm(): void {
    this.qty = null;
    this.price = null;
    this.isLoading = false;
    this.errorMessage = '';
    this.estimatedTotal = 0;
    this.availableQty = 0;
  }
}
