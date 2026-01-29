import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TransactionModalComponent } from './transaction-modal.component';
import { DataService } from '../../../core/services/data.service';
import { SimpleChange } from '@angular/core';
import { FormsModule } from '@angular/forms';

describe('TransactionModalComponent', () => {
  let component: TransactionModalComponent;
  let fixture: ComponentFixture<TransactionModalComponent>;
  let dataServiceSpy: jasmine.SpyObj<DataService>;

  // Datos mockeados controlables
  let mockAssets = [
    { ticker: 'AAPL', quantity: 10, current_price: 150, avg_cost: 100, name: 'Apple', type: 'Stock', marketValue: 1500, category: 'Tech' }
  ];
  let mockCashBalance = 1000;

  beforeEach(async () => {
    // Mock del DataService con getters dinámicos
    dataServiceSpy = jasmine.createSpyObj('DataService', ['executeTransaction', 'getMarketPrice'], {
      mockData: {
        get assets() { return mockAssets; },
        get cashBalance() { return mockCashBalance; }
      }
    });

    await TestBed.configureTestingModule({
      imports: [TransactionModalComponent, FormsModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Resetear datos antes de cada test
  beforeEach(() => {
    mockAssets = [{ ticker: 'AAPL', quantity: 10, current_price: 150, avg_cost: 100, name: 'Apple', type: 'Stock', marketValue: 1500, category: 'Tech' }];
    mockCashBalance = 1000;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- Getters Coverage ---
  describe('Getters', () => {
    it('should retrieve buyingPower and userAssets from service', () => {
      expect(component.buyingPower).toBe(1000);
      expect(component.userAssets.length).toBe(1);
    });

    it('should return 0/empty if mockData properties are undefined', () => {
      // Forzar undefined temporalmente en el spy
      const originalMock = dataServiceSpy.mockData;
      Object.defineProperty(dataServiceSpy, 'mockData', { get: () => ({}) });
      
      expect(component.buyingPower).toBe(0);
      expect(component.userAssets).toEqual([]);

      // Restaurar
      Object.defineProperty(dataServiceSpy, 'mockData', { get: () => originalMock });
    });

    it('should validate form correctly (isFormInvalid)', () => {
      component.ticker = ''; 
      expect(component.isFormInvalid).toBeTrue(); // No ticker

      component.ticker = 'AAPL';
      component.qty = null;
      expect(component.isFormInvalid).toBeTrue(); // No qty

      component.qty = 10;
      component.price = null;
      expect(component.isFormInvalid).toBeTrue(); // No price

      component.price = 100;
      component.qty = 0;
      expect(component.isFormInvalid).toBeTrue(); // Qty <= 0

      component.qty = 10;
      component.price = 0;
      expect(component.isFormInvalid).toBeTrue(); // Price <= 0

      component.price = 100;
      expect(component.isFormInvalid).toBeFalse(); // Valid
    });

    it('should detect insufficient funds (BUY)', () => {
      component.currentType = 'BUY';
      component.qty = 10;
      component.price = 200; // Total 2000 > 1000 Cash
      component.calculateTotal();
      expect(component.hasInsufficientFunds).toBeTrue();

      component.price = 50; // Total 500 < 1000 Cash
      component.calculateTotal();
      expect(component.hasInsufficientFunds).toBeFalse();
    });

    it('should detect insufficient quantity (SELL)', () => {
      component.currentType = 'SELL';
      component.availableQty = 5;
      
      component.qty = 6;
      expect(component.hasInsufficientQty).toBeTrue();

      component.qty = 5;
      expect(component.hasInsufficientQty).toBeFalse();
    });
  });

  // --- Methods Coverage ---
  describe('ngOnChanges', () => {
    it('should update market data when isOpen becomes true', () => {
      component.isOpen = true;
      component.ticker = 'AAPL';
      component.type = 'SELL';
      
      // Simulamos el cambio
      component.ngOnChanges({
        isOpen: new SimpleChange(false, true, true)
      });

      expect(component.currentType).toBe('SELL');
      expect(component.price).toBe(150); // Precio del mockAsset
      expect(component.availableQty).toBe(10);
    });

    it('should not do anything if inputs change but isOpen is false', () => {
      component.isOpen = false;
      component.ngOnChanges({
        ticker: new SimpleChange('OLD', 'NEW', false)
      });
      expect(component.price).toBeNull();
    });
  });

  describe('updateMarketData', () => {
    it('should reset values if ticker is empty', () => {
      component.ticker = '';
      component.updateMarketData();
      expect(component.price).toBeNull();
      expect(component.availableQty).toBe(0);
    });

    it('should use service market price if asset not in portfolio', () => {
      component.ticker = 'TSLA'; // No está en mockAssets
      dataServiceSpy.getMarketPrice.and.returnValue(250);
      
      component.updateMarketData();
      
      expect(component.price).toBe(250);
      expect(component.availableQty).toBe(0);
    });

    it('should fallback to 150 if service returns no price for new asset', () => {
      component.ticker = 'UNKNOWN';
      dataServiceSpy.getMarketPrice.and.returnValue(0); // o undefined
      
      component.updateMarketData();
      expect(component.price).toBe(150.00);
    });
  });

  describe('setType', () => {
    it('should switch type and reset form', () => {
      component.setType('SELL');
      expect(component.currentType).toBe('SELL');
      expect(component.qty).toBeNull();
    });

    it('should auto-select an owned ticker if switching to SELL with unowned ticker', () => {
      component.ticker = 'TSLA'; // No la tenemos
      component.setType('SELL');
      
      // Debería cambiar a AAPL que sí tenemos
      expect(component.ticker).toBe('AAPL');
    });

    it('should set ticker to empty if switching to SELL with NO assets', () => {
      mockAssets = []; // Vaciamos portafolio
      component.ticker = 'TSLA';
      component.setType('SELL');
      expect(component.ticker).toBe('');
    });
  });

  describe('onSubmit', () => {
    it('should return early if form is invalid', async () => {
      component.qty = null; // Inválido
      await component.onSubmit();
      expect(dataServiceSpy.executeTransaction).not.toHaveBeenCalled();
    });

    it('should execute transaction successfully', async () => {
      // Setup válido
      component.ticker = 'AAPL';
      component.qty = 1;
      component.price = 100;
      component.currentType = 'BUY';
      
      const closeSpy = spyOn(component.close, 'emit');
      const completeSpy = spyOn(component.transactionCompleted, 'emit');

      await component.onSubmit();

      expect(component.isLoading).toBeFalse();
      expect(dataServiceSpy.executeTransaction).toHaveBeenCalledWith('AAPL', 1, 100, 'BUY');
      expect(completeSpy).toHaveBeenCalled();
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  it('onClose should emit close event', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.close.emit).toHaveBeenCalled();
  });
});