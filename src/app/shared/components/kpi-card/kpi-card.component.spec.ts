import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardComponent } from './kpi-card.component';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Import CurrencyPipe

describe('KpiCardComponent', () => {
  let component: KpiCardComponent;
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, KpiCardComponent, CurrencyFormatPipe],
      // REGLA 1: CurrencyFormatPipe necesita CurrencyPipe
      providers: [CurrencyPipe] 
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title and formatted value', () => {
    // Arrange
    component.title = 'Test Title';
    component.value = 12345.67;
    component.isLoading = false;
    fixture.detectChanges();

    // Act
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('.kpi-title');
    const valueElement = compiled.querySelector('.kpi-value');

    // Assert
    expect(titleElement?.textContent).toContain('Test Title');
    // El pipe interno (CurrencyPipe) debe formatear el número
    expect(valueElement?.textContent).toContain('$12,345.67'); 
  });

  it('should show a positive trend icon and color for positive change', () => {
    // Arrange
    component.change = 2.5;
    component.isLoading = false;
    fixture.detectChanges();

    // Act
    const compiled = fixture.nativeElement as HTMLElement;
    const changeElement = compiled.querySelector('.kpi-change');
    
    // Assert
    expect(changeElement?.classList).toContain('text-green-400');
    expect(changeElement?.classList).not.toContain('text-red-400');
  });

  it('should display a skeleton loader when isLoading is true', () => {
    // Arrange
    component.isLoading = true;
    fixture.detectChanges();

    // Act
    const compiled = fixture.nativeElement as HTMLElement;
    const valueSkeleton = compiled.querySelector('.h-8.w-3/4'); 
    const changeSkeleton = compiled.querySelector('.h-4.w-1/4');

    // Assert
    expect(valueSkeleton).not.toBeNull();
    expect(changeSkeleton).not.toBeNull();
  });
});
