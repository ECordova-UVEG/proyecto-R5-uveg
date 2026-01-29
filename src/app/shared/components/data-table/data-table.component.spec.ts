import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';

describe('DataTableComponent', () => {
  let component: DataTableComponent;
  let fixture: ComponentFixture<DataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Output Events', () => {
    it('should emit action event with item when onActionButtonClick is called', () => {
      spyOn(component.action, 'emit');
      const testItem = { id: 1, name: 'Test' };

      component.onActionButtonClick(testItem);

      expect(component.action.emit).toHaveBeenCalledWith(testItem);
    });
  });

  describe('Helper getProperty', () => {
    // Caso 1: Propiedad simple
    it('should retrieve a simple property', () => {
      const obj = { name: 'Juan' };
      const result = component.getProperty(obj, 'name');
      expect(result).toBe('Juan');
    });

    // Caso 2: Propiedad anidada
    it('should retrieve a nested property', () => {
      const obj = { user: { details: { age: 30 } } };
      const result = component.getProperty(obj, 'user.details.age');
      expect(result).toBe(30);
    });

    // Caso 3: Objeto nulo/indefinido (Branch coverage: 'o && ...')
    // Esto prueba que la función no explote si el objeto inicial es null
    it('should return undefined/null if the initial object is null', () => {
      const result = component.getProperty(null, 'any.path');
      expect(result).toBeNull(); 
    });

    // Caso 4: Ruta rota (Branch coverage: '... && o[p]')
    // Esto prueba que si una propiedad intermedia no existe, devuelve undefined sin error
    it('should safely return undefined for broken paths', () => {
      const obj = { user: null }; // 'user' existe pero es null
      // Intentamos acceder a 'user.name'. Al llegar a 'user', o es null, así que el && detiene la ejecución
      const result = component.getProperty(obj, 'user.name');
      expect(result).toBeNull(); 
    });
    
    // Caso 5: Propiedad que no existe en absoluto
    it('should return undefined for non-existent properties', () => {
        const obj = { name: 'Test' };
        const result = component.getProperty(obj, 'age');
        expect(result).toBeUndefined();
    });
  });
});