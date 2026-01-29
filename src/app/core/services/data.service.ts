import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const INITIAL_SEED_DATA: any = {
  cashBalance: 1000000,
  transactions: [],
  assets: [
    { ticker: 'AAPL', name: 'Apple Inc.', type: 'Stock', quantity: 15, avg_cost: 185.50, current_price: 192.30, category: 'Renta Variable' },
    { ticker: 'TSLA', name: 'Tesla Inc.', type: 'Stock', quantity: 5, avg_cost: 210.00, current_price: 180.50, category: 'Renta Variable' },
    { ticker: 'MSFT', name: 'Microsoft Corp.', type: 'Stock', quantity: 8, avg_cost: 350.00, current_price: 405.00, category: 'Renta Variable' },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', type: 'Stock', quantity: 4, avg_cost: 450.00, current_price: 680.00, category: 'Renta Variable' },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', type: 'Stock', quantity: 20, avg_cost: 140.00, current_price: 165.00, category: 'Renta Variable' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', type: 'Stock', quantity: 12, avg_cost: 130.00, current_price: 145.00, category: 'Renta Variable' },
    { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'ETF', quantity: 10, avg_cost: 380.00, current_price: 415.00, category: 'Renta Variable' }
  ]
};

// --- INTERFACES ---
export interface Investment {
  ticker: string;
  name: string;
  quantity: number;
  current_price: number;
  avg_cost: number;
  type: "Stock" | "ETF" | "FIBRA" | "Bonos" | "Crypto";
  category: "Renta Variable" | "Renta Fija";
  currency?: string;
  // Calculated fields
  marketValue?: number;
  gainLoss?: number;
  yieldPct?: number;
  low52?: number;
  high52?: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalGainLoss: number;
  totalYieldPct: number;
  allocation: {
    [category: string]: {
      value: number;
      percentage: number;
      gainLoss: number; // Added gainLoss to category allocation
      yieldPct: number;
    }
  };
}

export interface Transaction {
  type: 'BUY' | 'SELL';
  ticker: string;
  qty: number;
  price: number;
  date: Date;
  total: number;
}

export interface PortfolioData {
  assets: Investment[];
  summary: PortfolioSummary;
  cashBalance: number;
  transactions: Transaction[];
}

// --- SERVICE ---
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private portfolioData$ = new BehaviorSubject<PortfolioData | null>(null);
  private tradeRequest$ = new BehaviorSubject<{ asset: Investment, type: 'BUY' | 'SELL' } | null>(null);
  
  // Centralized data object
  mockData: {
    assets: Investment[],
    transactions: Transaction[],
    cashBalance: number
  } = { assets: [], transactions: [], cashBalance: 0 };

  public exchangeRates = { usd: 19.85, eur: 21.40 };
  public isMarketOpen: boolean = false;
  public pendingTrade: { ticker: string, type: 'BUY' | 'SELL' } | null = null;

  get marketStatusLabel(): string {
    return this.isMarketOpen ? 'Mercado Abierto' : 'Mercado Cerrado';
  }

  constructor() {
    this._loadFromStorage();
    this.startServiceLoop();
  }

  private startServiceLoop(): void {
    this.checkMarketStatus(); // Initial check
    setInterval(() => {
      this.checkMarketStatus();
      this.updateForex();
    }, 1000);
  }

  private checkMarketStatus() {
    const now = new Date();
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Mexico_City',
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'long',
      hour12: false
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);
    
    const hourVal = parts.find(p => p.type === 'hour')?.value || '0';
    const minVal = parts.find(p => p.type === 'minute')?.value || '0';
    const dayVal = parts.find(p => p.type === 'weekday')?.value || '';
    const hour = parseInt(hourVal, 10);
    const minute = parseInt(minVal, 10);

    if (dayVal === 'Saturday' || dayVal === 'Sunday') {
      this.isMarketOpen = false;
      return;
    }
    
    if (hour < 8 || (hour === 8 && minute < 30) || hour >= 15) {
      this.isMarketOpen = false;
    } else {
      this.isMarketOpen = true;
    }
  }

  private updateForex(): void {
    if (!this.isMarketOpen) return;
    this.exchangeRates.usd += (Math.random() - 0.5) * 0.1;
    this.exchangeRates.eur += (Math.random() - 0.5) * 0.1;
  }

  private processAndEmitData(data: { assets: Investment[], transactions: Transaction[], cashBalance: number }): void {
    const calculatedAssets = data.assets.map((asset: Investment) => {
        const qty = asset.quantity || 0;
        const price = asset.current_price || 0;
        const cost = asset.avg_cost || (price * 0.9);
        const type = asset.type || 'Stock';

        return {
            ...asset,
            ticker: asset.ticker,
            name: asset.name || asset.ticker,
            quantity: qty,
            current_price: price,
            avg_cost: cost,
            type: type,
            category: asset.category || (['FIBRA','Bonos'].includes(type) ? 'Renta Fija' : 'Renta Variable'),
            currency: 'MXN',
            marketValue: qty * price,
            gainLoss: (price - cost) * qty,
            yieldPct: cost > 0 ? (price - cost) / cost : 0,
            low52: price * 0.85,
            high52: price * 1.15,
        };
    });

    const summary = this.calculateSummary(calculatedAssets);
    
    this.portfolioData$.next({ 
      assets: calculatedAssets, 
      summary,
      cashBalance: data.cashBalance,
      transactions: data.transactions
    });
  }

  private _saveToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('investcore_data', JSON.stringify(this.mockData));
    }
  }

  private _loadFromStorage() {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('investcore_data') : null;
    
    if (stored) {
      try {
        this.mockData = JSON.parse(stored);
        this.mockData.assets = this.mockData.assets || [];
        this.mockData.transactions = this.mockData.transactions || [];
        this.mockData.cashBalance = this.mockData.cashBalance ?? 1000000;
      } catch (e) {
        console.error('Error parsing stored data, resetting...', e);
        this.mockData = { ...INITIAL_SEED_DATA };
      }
    } else {
      console.log('Initializing with seed data...');
      this.mockData = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
      this._saveToStorage();
    }
    
    this.processAndEmitData(this.mockData);
  }
  
  private calculateSummary(assets: Investment[]): PortfolioSummary {
    const totalValue = assets.reduce((sum, asset) => sum + (asset.marketValue || 0), 0);
    const totalGainLoss = assets.reduce((sum, asset) => sum + (asset.gainLoss || 0), 0);
    const totalCostBasis = assets.reduce((sum, asset) => sum + (asset.avg_cost * asset.quantity), 0);
    const totalYieldPct = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) : 0;

    const allocation: PortfolioSummary['allocation'] = {};

    assets.forEach(asset => {
      if (!allocation[asset.category]) {
        allocation[asset.category] = { value: 0, percentage: 0, gainLoss: 0, yieldPct: 0 };
      }
      allocation[asset.category].value += asset.marketValue || 0;
      allocation[asset.category].gainLoss += asset.gainLoss || 0;
    });

    for (const category in allocation) {
      allocation[category].percentage = totalValue > 0 ? (allocation[category].value / totalValue) : 0;
      const categoryAssets = assets.filter(a => a.category === category);
      const categoryCostBasis = categoryAssets.reduce((sum, a) => sum + (a.avg_cost * a.quantity), 0);
      allocation[category].yieldPct = categoryCostBasis > 0 ? (allocation[category].gainLoss / categoryCostBasis) : 0;
    }

    return { totalValue, totalGainLoss, totalYieldPct, allocation };
  }

  public getPortfolioData(): Observable<PortfolioData | null> {
    return this.portfolioData$.asObservable();
  }

  public getTradeRequests(): Observable<{ asset: Investment, type: 'BUY' | 'SELL' } | null> {
    return this.tradeRequest$.asObservable();
  }

  public initiateTrade(asset: Investment, type: 'BUY' | 'SELL'): void {
    this.tradeRequest$.next({ asset, type });
  }

  public getMarketPrice(ticker: string): number {
    const normalizedTicker = ticker.toUpperCase();
    const asset = this.mockData.assets.find(a => a.ticker.toUpperCase() === normalizedTicker);
    return asset ? asset.current_price : parseFloat((Math.random() * (2000 - 100) + 100).toFixed(2));
  }

  private _hasSufficientFunds(required: number): boolean {
    if (required > this.mockData.cashBalance) {
      throw new Error(`Saldo insuficiente. Requieres $${required.toFixed(2)} pero tienes $${this.mockData.cashBalance.toFixed(2)}`);
    }
    return true;
  }

  private _hasSufficientShares(ticker: string, quantityToSell: number): boolean {
    const asset = this.mockData.assets.find(a => a.ticker === ticker.toUpperCase());
    if (!asset) {
      throw new Error('No posees este activo para vender.');
    }
    if (quantityToSell > asset.quantity) {
      throw new Error(`No puedes vender ${quantityToSell} acciones. Solo tienes ${asset.quantity}.`);
    }
    return true;
  }

  public executeTransaction(ticker: string, qty: number, price: number, type: 'BUY' | 'SELL') {
    const upperTicker = ticker.toUpperCase();
    const assetIndex = this.mockData.assets.findIndex(a => a.ticker === upperTicker);
    const totalOperationValue = qty * price;

    if (type === 'BUY') {
      this._hasSufficientFunds(totalOperationValue);
      this.mockData.cashBalance -= totalOperationValue;

      if (assetIndex >= 0) {
        const asset = this.mockData.assets[assetIndex];
        const totalCostOld = asset.quantity * asset.avg_cost;
        asset.quantity += qty;
        asset.avg_cost = (totalCostOld + totalOperationValue) / asset.quantity;
        asset.current_price = price;
      } else {
        this.mockData.assets.push({
          ticker: upperTicker, name: upperTicker, type: 'Stock',
          quantity: qty, avg_cost: price, current_price: price,
          category: 'Renta Variable'
        } as Investment);
      }
    } else { // SELL
      this._hasSufficientShares(upperTicker, qty);
      const asset = this.mockData.assets[assetIndex];
      this.mockData.cashBalance += totalOperationValue;
      asset.quantity -= qty;
      asset.current_price = price;

      if (asset.quantity === 0) {
        this.mockData.assets.splice(assetIndex, 1);
      }
    }

    const transaction: Transaction = {
      type, ticker: upperTicker, qty, price,
      total: totalOperationValue, date: new Date()
    };
    this.mockData.transactions.unshift(transaction);

    this._saveToStorage();
    this.processAndEmitData(this.mockData);
  }

  /**
   * Updates the prices of multiple assets in the portfolio based on real-time data.
   * It recalculates key financial metrics for each updated asset, such as its market value,
   * the total gain or loss (`gainLoss`), and the yield percentage.
   * If any price changes, it saves the new state and notifies all subscribers.
   * @param newPrices An array of objects, where each object must contain a `symbol` (ticker) and a `price`.
   */
  updateAssetPrices(newPrices: { symbol: string, price: number }[]) {
    let dataChanged = false;
    const priceMap = new Map<string, number>();
    newPrices.forEach(p => priceMap.set(p.symbol, p.price));

    this.mockData.assets.forEach(asset => {
      const realPrice = priceMap.get(asset.ticker.toUpperCase());
      if (realPrice && realPrice !== asset.current_price) {
        asset.current_price = realPrice;
        asset.marketValue = asset.quantity * asset.current_price;
        const totalCost = asset.quantity * asset.avg_cost;
        asset.gainLoss = asset.marketValue - totalCost;
        asset.yieldPct = totalCost > 0 ? (asset.gainLoss / totalCost) : 0;
        dataChanged = true;
      }
    });

    if (dataChanged) {
      this._saveToStorage();
      this.processAndEmitData(this.mockData);
      console.log('⚡ Precios de mercado actualizados');
    }
  }

  // Legacy methods - to be deprecated or updated
  getInvestments(): Observable<Investment[]> {
    return this.portfolioData$.pipe(
      map(data => data ? data.assets : [])
    );
  }

  public getPortfolioHistory(): { date: string, value: number }[] {
    const history = [];
    const today = new Date();
    let currentValue = 50000; // Starting value 6 months ago

    for (let i = 180; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        // Simulate gentle upward trend + volatility
        const dailyChange = (Math.random() - 0.45) * 2000; // Random fluctuation
        const trend = (180 - i) * 10; // Gradual growth
        currentValue += dailyChange + trend;
        
        if (currentValue < 0) currentValue = Math.random() * 1000;

        history.push({
            date: date.toISOString().split('T')[0],
            value: parseFloat(currentValue.toFixed(2))
        });
    }
    return history;
  }

  /**
   * Resets all portfolio data (assets, transactions, cash balance) to the initial seed data.
   * This also clears the stored data in localStorage and re-emits the initial portfolio state.
   */
  public reset(): void {
    this.mockData = JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
    this._saveToStorage();
    this.processAndEmitData(this.mockData);
    console.log('🔄 DataService: Datos reseteados a estado inicial.');
  }
}
