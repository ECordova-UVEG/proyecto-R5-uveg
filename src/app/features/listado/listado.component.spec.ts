import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CurrencyPipe, PercentPipe, CommonModule } from '@angular/common';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { ListadoComponent } from './listado.component';
import { DataService } from '../../core/services/data.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { TransactionModalComponent } from '../../shared/components/transaction-modal/transaction-modal.component';

// MOCK DE DATOS
const mockData = {
  assets: [
    { 
      ticker: 'AAPL', name: 'Apple Inc.', type: 'Stock', // type es 'Stock'
      quantity: 10, avg_cost: 150, current_price: 180, category: 'Renta Variable', 
      marketValue: 1800, gainLoss: 300, yieldPct: 0.2 
    },
    { 
      ticker: 'FMTY', name: 'Fibra Mty', type: 'FIBRA', // type es 'FIBRA'
      quantity: 100, avg_cost: 12, current_price: 12, category: 'Renta Fija', 
      marketValue: 1200, gainLoss: 0, yieldPct: 0 
    }
  ],
  summary: { totalValue: 3000, totalGainLoss: 300, totalYieldPct: 0.1, allocation: {} },
  cashBalance: 1000,
  transactions: []
};

describe('ListadoComponent', () => {
  let component: ListadoComponent;
  let fixture: ComponentFixture<ListadoComponent>;
  let dataService: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['getPortfolioData']);

    await TestBed.configureTestingModule({
      imports: [
        ListadoComponent, 
        CommonModule, 
        FormsModule, 
        CurrencyFormatPipe, 
        TransactionModalComponent 
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        CurrencyPipe,
        PercentPipe,
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    // Mockeamos respuesta inmediata
    dataService.getPortfolioData.and.returnValue(of(mockData as any));

    fixture = TestBed.createComponent(ListadoComponent);
    component = fixture.componentInstance;
    // NO ejecutamos detectChanges aquí para controlar el tiempo manualmente en cada test
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load portfolio data on init and handle loading timeout', fakeAsync(() => {
    // 1. Inicia ngOnInit -> Llama al servicio -> Inicia setTimeout de 500ms
    fixture.detectChanges(); 
    
    // 2. Resolvemos la suscripción del observable
    tick(); 
    
    // 3. Resolvemos el setTimeout(500) del componente
    tick(500); 

    // 4. Actualizamos la vista
    fixture.detectChanges();

    expect(dataService.getPortfolioData).toHaveBeenCalled();
    expect(component.investments.length).toBe(2);
    expect(component.isLoading()).toBeFalse(); // Ahora sí debe ser false
  }));

  it('should filter by search term "Fibra"', fakeAsync(() => {
    // Inicialización completa (consumiendo el timer de carga)
    fixture.detectChanges();
    tick(500); 
    fixture.detectChanges();

    // Act
    component.filterValue = 'Fibra';
    component.filterData();
    fixture.detectChanges();

    // Assert
    expect(component.filteredInvestments.length).toBe(1);
    expect(component.filteredInvestments[0].ticker).toBe('FMTY');
  }));

  it('should filter by category (Type) "FIBRA"', fakeAsync(() => {
    // Inicialización completa
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();

    // Act
    // TU COMPONENTE FILTRA POR 'TYPE', NO POR 'CATEGORY'.
    // En el mock, el type es 'FIBRA', no 'Renta Fija'.
    component.selectCategory('FIBRA'); 
    fixture.detectChanges();

    // Assert
    expect(component.selectedCategory).toBe('FIBRA');
    expect(component.filteredInvestments.length).toBe(1);
    // Verificamos que el elemento filtrado es el correcto
    expect(component.filteredInvestments[0].ticker).toBe('FMTY');
  }));
  
  it('should open and close the asset detail modal', fakeAsync(() => {
    // Inicialización completa para limpiar el timer del ngOnInit
    fixture.detectChanges();
    tick(500);
    
    const asset = mockData.assets[0] as any;
    
    // Open
    component.openModal(asset);
    expect(component.selectedAsset).toEqual(asset);
    expect(document.body.style.overflow).toBe('hidden'); // Verifica bloqueo de scroll
    
    // Close
    component.closeModal();
    expect(component.selectedAsset).toBeNull();
    expect(document.body.style.overflow).toBe('auto'); // Verifica desbloqueo
  }));
});