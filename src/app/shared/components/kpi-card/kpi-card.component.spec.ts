import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardComponent } from './kpi-card.component';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { CommonModule } from '@angular/common';

describe('KpiCardComponent', () => {
  let component: KpiCardComponent;
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, KpiCardComponent, CurrencyFormatPipe],
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
    expect(valueElement?.textContent).toContain('$12,345.67'); // Assuming CurrencyFormatPipe works
  });

  it('should show a positive trend icon and color for positive change', () => {
    // Arrange
    component.change = 2.5;
    component.isLoading = false;
    fixture.detectChanges();

    // Act
    const compiled = fixture.nativeElement as HTMLElement;
    const changeElement = compiled.querySelector('.kpi-change');
    const iconElement = compiled.querySelector('svg');

    // Assert
    expect(changeElement).toHaveClass('text-green-400');
    expect(changeElement).not.toHaveClass('text-red-400');
    // A simple way to check for the up-arrow SVG path
    expect(iconElement?.innerHTML).toContain('M12 5l7 7h-14z');
  });

  it('should show a negative trend icon and color for negative change', () => {
    // Arrange
    component.change = -1.8;
    component.isLoading = false;
    fixture.detectChanges();

    // Act
    const compiled = fixture.nativeElement as HTMLElement;
    const changeElement = compiled.querySelector('.kpi-change');
    const iconElement = compiled.querySelector('svg');
    
    // Assert
    expect(changeElement).toHaveClass('text-red-400');
    expect(changeElement).not.toHaveClass('text-green-400');
    // A simple way to check for the down-arrow SVG path
    expect(iconElement?.innerHTML).toContain('M12 19l-7-7h14z');
  });

  it('should display a skeleton loader when isLoading is true', () => {
    // Arrange
    component.isLoading = true;
    fixture.detectChanges();

    // Act
    const compiled = fixture.nativeElement as HTMLElement;
    const valueSkeleton = compiled.querySelector('.h-8.w-3/4'); // From skeleton's classes
    const changeSkeleton = compiled.querySelector('.h-4.w-1/4');

    // Assert
    expect(valueSkeleton).not.toBeNull();
    expect(changeSkeleton).not.toBeNull();
  });
});