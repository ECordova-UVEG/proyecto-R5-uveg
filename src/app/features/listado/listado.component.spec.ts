import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ListadoComponent } from './listado.component';
import { DataService, Investment, PortfolioSummary } from '../../core/services/data.service';

const mockAssets: Investment[] = [
  { ticker: 'AAPL', name: 'Apple', type: 'Stock', quantity: 10, avg_cost: 150, current_price: 180, marketValue: 1800, gainLoss: 300, yieldPct: 0.2, category: 'Renta Variable' },
  { ticker: 'MSFT', name: 'Microsoft', type: 'Stock', quantity: 5, avg_cost: 300, current_price: 330, marketValue: 1650, gainLoss: 150, yieldPct: 0.1, category: 'Renta Variable' }
];

const mockSummary: PortfolioSummary = {
  totalValue: 3450,
  totalGainLoss: 450,
  totalYieldPct: 0.13,
  allocation: {}
};

describe('ListadoComponent', () => {
  let component: ListadoComponent;
  let fixture: ComponentFixture<ListadoComponent>;
  let dataService: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['getPortfolioData']);

    await TestBed.configureTestingModule({
      imports: [ListadoComponent],
      providers: [
        // REGLA 4: Proveer HTTP y Router
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        // REGLA 1: Proveer CurrencyPipe (y PercentPipe que también se usa)
        CurrencyPipe,
        PercentPipe,
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    dataService.getPortfolioData.and.returnValue(of({
      assets: mockAssets,
      summary: mockSummary,
      cashBalance: 0,
      transactions: []
    }));

    fixture = TestBed.createComponent(ListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load portfolio data on initialization', () => {
    expect(dataService.getPortfolioData).toHaveBeenCalled();
    expect(component.investments.length).toBe(2);
    expect(component.summary).toEqual(mockSummary);
    expect(component.isLoading()).toBeFalse();
  });

  it('should filter investments by search term', () => {
    // Act
    component.filterValue = 'Micro';
    component.filterData();
    fixture.detectChanges();

    // Assert
    expect(component.filteredInvestments.length).toBe(1);
    expect(component.filteredInvestments[0].ticker).toBe('MSFT');
  });

  it('should filter investments by category', () => {
    // El mock tiene 2 'Stock', agreguemos una 'FIBRA' para el test
    component.investments.push({ ticker: 'FMTY', name: 'Fibra MTY', type: 'FIBRA', quantity: 100, avg_cost: 12, current_price: 12, category: 'Renta Fija' });
    component.categories = ['Todos', 'Stock', 'FIBRA'];
    fixture.detectChanges();
    
    // Act
    component.selectCategory('FIBRA');
    fixture.detectChanges();

    // Assert
    expect(component.filteredInvestments.length).toBe(1);
    expect(component.filteredInvestments[0].type).toBe('FIBRA');
  });

  it('should open the detail modal with the selected asset', () => {
    const assetToOpen = mockAssets[0];
    component.openModal(assetToOpen);
    expect(component.selectedAsset).toBe(assetToOpen);
  });
});
