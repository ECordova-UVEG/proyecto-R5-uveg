import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardComponent } from './kpi-card.component';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe'; // Asegúrate que la ruta sea correcta
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('KpiCardComponent', () => {
  let component: KpiCardComponent;
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Como es standalone, lo importamos, no lo declaramos
      imports: [CommonModule, KpiCardComponent, CurrencyFormatPipe], 
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    // Arrange
    const testTitle = 'Ingresos Totales';
    component.title = testTitle;
    fixture.detectChanges();

    // Act
    const compiled = fixture.nativeElement as HTMLElement;
    // Buscamos el texto en todo el componente ya que no tenemos el HTML exacto
    expect(compiled.textContent).toContain(testTitle);
  });

  it('should display the formatted value', () => {
    // Arrange
    component.value = 1000;
    component.format = 'currency';
    fixture.detectChanges();

    // Act
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Nota: Esto asume que tu CurrencyFormatPipe transforma 1000 en $1,000.00
    // Si tu pipe usa otro formato, ajusta el valor esperado.
    // Usamos una regex flexible para buscar el número
    expect(compiled.textContent).toMatch(/1,?000/); 
  });

  it('should handle null values gracefully', () => {
    component.value = null;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Verifica que no explote y que quizás muestre un guion o nada
    expect(component).toBeTruthy();
  });

  it('should identify positive values correctly', () => {
    component.value = 500;
    expect(component.isPositive).toBeTrue();
  });

  it('should identify negative values correctly', () => {
    component.value = -500;
    expect(component.isPositive).toBeFalse();
  });
});