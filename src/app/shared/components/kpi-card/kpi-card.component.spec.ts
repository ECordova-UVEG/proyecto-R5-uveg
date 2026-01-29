import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardComponent } from './kpi-card.component';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe'; // Ajusta la ruta si es necesario
import { CommonModule, CurrencyPipe } from '@angular/common';

describe('KpiCardComponent', () => {
  let component: KpiCardComponent;
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Importamos el componente (es standalone) y los módulos necesarios
      imports: [CommonModule, KpiCardComponent, CurrencyFormatPipe],
      // CRÍTICO: Inyectamos CurrencyPipe porque tu CurrencyFormatPipe lo usa internamente
      providers: [CurrencyPipe] 
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    component.title = 'Ingresos Totales';
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    // Buscamos el texto en cualquier parte del componente (más seguro que buscar clases específicas)
    expect(compiled.textContent).toContain('Ingresos Totales');
  });

  it('should format the value correctly', () => {
    component.value = 1500.50;
    component.format = 'currency';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    // Verificamos que aparezca el número formateado (ej: 1,500.50)
    // Usamos regex para ser flexibles con el símbolo de moneda
    expect(compiled.textContent).toMatch(/1,500\.50/);
  });

  it('should calculate isPositive correctly', () => {
    // Caso Positivo
    component.value = 100;
    expect(component.isPositive).toBeTrue();

    // Caso Negativo
    component.value = -100;
    expect(component.isPositive).toBeFalse();

    // Caso Nulo
    component.value = null;
    expect(component.isPositive).toBeFalse();
  });
});