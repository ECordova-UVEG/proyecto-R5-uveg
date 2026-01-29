import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ListadoComponent } from './listado.component';
import { DataService } from '../../core/services/data.service';
import { of } from 'rxjs';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { PercentPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Investment } from '../../core/services/data.service';

describe('ListadoComponent', () => {
  let component: ListadoComponent;
  let fixture: ComponentFixture<ListadoComponent>;
  let mockDataService: any;

  // Mock Data
  const mockAssets: Investment[] = [
    {
      ticker: 'AAPL',
      name: 'Apple Inc',
      type: 'Stock',
      quantity: 10,
      avg_cost: 150,
      current_price: 180,
      marketValue: 1800,
      gainLoss: 300,
      yieldPct: 0.2,
      category: 'Renta Variable'
    },
    {
      ticker: 'FMTY14',
      name: 'Fibra Mty',
      type: 'FIBRA',
      quantity: 1000,
      avg_cost: 10,
      current_price: 12,
      marketValue: 12000,
      gainLoss: 2000,
      yieldPct: 0.2,
      category: 'Renta Variable'
    }
  ];

  const mockSummary = {
    totalValue: 13800,
    totalGainLoss: 2300,
    totalYieldPct: 0.2,
    allocation: {
      'Stock': { value: 1800, percentage: 0.13, gainLoss: 300, yieldPct: 0.2 },
      'FIBRA': { value: 12000, percentage: 0.87, gainLoss: 2000, yieldPct: 0.2 }
    }
  };

  const mockPortfolioData = {
    assets: mockAssets,
    summary: mockSummary
  };

  beforeEach(async () => {
    // 1. Crear Mock del Servicio
    mockDataService = {
      getPortfolioData: jasmine.createSpy('getPortfolioData').and.returnValue(of(mockPortfolioData))
    };

    await TestBed.configureTestingModule({
      // ListadoComponent es standalone, así que lo importamos.
      imports: [
        ListadoComponent,
        CommonModule,
        FormsModule,
        CurrencyFormatPipe, // Importamos los pipes que usa
        SkeletonComponent
      ],
      // Proveemos el mock en lugar del servicio real
      providers: [
        { provide: DataService, useValue: mockDataService },
        PercentPipe
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Dispara ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    expect(mockDataService.getPortfolioData).toHaveBeenCalled();
    expect(component.investments.length).toBe(2);
    expect(component.summary).toEqual(mockSummary);
    expect(component.isLoading()).toBeFalse();
  });

  it('should filter data by category', () => {
    component.selectCategory('Stock');
    expect(component.selectedCategory).toBe('Stock');
    expect(component.filteredInvestments.length).toBe(1);
    expect(component.filteredInvestments[0].ticker).toBe('AAPL');
  });

  it('should filter data by search term', () => {
    component.filterValue = 'Fibra';
    component.filterData();
    expect(component.filteredInvestments.length).toBe(1);
    expect(component.filteredInvestments[0].ticker).toBe('FMTY14');
  });

  it('should open and close modal', () => {
    const asset = mockAssets[0];

    // Open
    component.openModal(asset);
    expect(component.selectedAsset).toEqual(asset);
    expect(document.body.style.overflow).toBe('hidden');

    // Close
    component.closeModal();
    expect(component.selectedAsset).toBeNull();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('should paginate correctly', () => {
    // Forzamos itemsPerPage a 1 para probar paginación con 2 items
    component.itemsPerPage = 1;
    component.filterData(); // Recalcular paginación

    expect(component.paginatedAssets.length).toBe(1);
    expect(component.paginatedAssets[0].ticker).toBe('AAPL');

    component.nextPage();
    expect(component.currentPage).toBe(2);
    expect(component.paginatedAssets[0].ticker).toBe('FMTY14');

    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('should calculate empty rows correctly', () => {
    component.itemsPerPage = 5;
    // Tenemos 2 items, deberíamos tener 3 filas vacías
    expect(component.emptyRows.length).toBe(3);
  });
});