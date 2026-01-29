import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CurrencyPipe } from '@angular/common';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { DataService } from '../../core/services/data.service';
import { MarketDataService } from '../../core/services/market-data.service';

const mockPortfolio = {
  summary: { totalValue: 50000, totalGainLoss: 2500, totalYieldPct: 0.05, allocation: {} },
  assets: [{ ticker: 'AAPL', name: 'Apple', type: 'Stock', quantity: 10, avg_cost: 150, current_price: 155, category: 'Renta Variable' }],
  cashBalance: 10000,
  transactions: []
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dataService: jasmine.SpyObj<DataService>;
  let marketService: jasmine.SpyObj<MarketDataService>;

  beforeEach(async () => {
    // Crear spies para los servicios
    const dataServiceSpy = jasmine.createSpyObj('DataService', 
      ['getPortfolioData', 'updateAssetPrices', 'getPortfolioHistory'],
      { 
        // Usar un "getter" para mockData para que sea configurable
        get mockData() { return { assets: mockPortfolio.assets }; },
        exchangeRates: { usd: 0, eur: 0 }
      }
    );
    const marketServiceSpy = jasmine.createSpyObj('MarketDataService', ['getCurrencies', 'getRealTimePrices']);

    // Configurar el TestBed
    await TestBed.configureTestingModule({
      imports: [DashboardComponent], // Componente Standalone
      providers: [
        // REGLA 4: Proveer HTTP y Router
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        // REGLA 1: Proveer CurrencyPipe
        CurrencyPipe,
        { provide: DataService, useValue: dataServiceSpy },
        { provide: MarketDataService, useValue: marketServiceSpy },
      ],
    }).compileComponents();

    // Configurar el comportamiento de los spies
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    marketService = TestBed.inject(MarketDataService) as jasmine.SpyObj<MarketDataService>;
    
    dataService.getPortfolioData.and.returnValue(of(mockPortfolio));
    dataService.getPortfolioHistory.and.returnValue([]);
    marketService.getCurrencies.and.returnValue(of({ USD: 20.5, EUR: 21.8 }));
    marketService.getRealTimePrices.and.returnValue(of([{ symbol: 'AAPL', price: 155 }]));

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Ejecuta ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial portfolio data on init', () => {
    expect(dataService.getPortfolioData).toHaveBeenCalled();
    expect(component.totalPortfolioValue).toBe(mockPortfolio.summary.totalValue);
    expect(component.dailyGainLoss).toBe(mockPortfolio.summary.totalGainLoss);
  });

  it('should fetch and update market prices on init', () => {
    // fetchMarketData es llamado en ngOnInit
    expect(marketService.getRealTimePrices).toHaveBeenCalledWith(['AAPL']);
    expect(dataService.updateAssetPrices).toHaveBeenCalledWith([{ symbol: 'AAPL', price: 155 }]);
  });

  it('should fetch and set currency prices on init', () => {
    expect(marketService.getCurrencies).toHaveBeenCalled();
    expect(component.usdPrice).toBe(20.5);
    expect(component.eurPrice).toBe(21.8);
  });
});
