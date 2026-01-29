import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { DataService } from '../../core/services/data.service';
import { MarketDataService } from '../../core/services/market-data.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';

// Mock de datos básicos
const mockPortfolio = {
  summary: { totalValue: 1000, totalGainLoss: 50 },
  assets: [{ ticker: 'AAPL', quantity: 10, marketValue: 1500, type: 'Stock' }],
  cashBalance: 500
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let marketServiceMock: any;
  let dataServiceMock: any;

  beforeEach(async () => {
    // 1. Crear Mocks (Espías)
    marketServiceMock = {
      getCurrencies: jasmine.createSpy('getCurrencies').and.returnValue(of({ USD: 20, EUR: 22 })),
      getRealTimePrices: jasmine.createSpy('getRealTimePrices').and.returnValue(of([]))
    };

    dataServiceMock = {
      mockData: { assets: [] }, // Estado inicial
      getPortfolioData: jasmine.createSpy('getPortfolioData').and.returnValue(of(mockPortfolio)),
      getPortfolioHistory: jasmine.createSpy('getPortfolioHistory').and.returnValue([]),
      updateAssetPrices: jasmine.createSpy('updateAssetPrices'),
      exchangeRates: { usd: 0, eur: 0 }
    };

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent, // Es standalone, se importa, no se declara
        HttpClientTestingModule, 
        CurrencyFormatPipe 
      ],
      providers: [
        { provide: MarketDataService, useValue: marketServiceMock },
        { provide: DataService, useValue: dataServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Dispara ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load portfolio data on init', () => {
    expect(dataServiceMock.getPortfolioData).toHaveBeenCalled();
    expect(component.totalPortfolioValue).toBe(1000);
  });

  it('should try to fetch market data on init', () => {
    expect(marketServiceMock.getCurrencies).toHaveBeenCalled();
    // getRealTimePrices se llama solo si hay assets, en el mockPortfolio hay uno
    // Nota: ngOnInit llama a fetchMarketData que usa this.dataService.mockData.assets.
    // Asegúrate de que tu mockData tenga assets si quieres probar esa línea.
  });
});