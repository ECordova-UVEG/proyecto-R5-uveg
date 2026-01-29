import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../shared/services/toast.service';
import { By } from '@angular/platform-browser';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let dataService: jasmine.SpyObj<DataService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['reset']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);

    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call dataService.reset when the reset button is clicked and confirmed', () => {
    // Arrange: Spy on the window.confirm method and make it return true
    spyOn(window, 'confirm').and.returnValue(true);
    const resetButton = fixture.debugElement.query(By.css('button'));

    // Act: Simulate a click on the button
    resetButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Assert
    expect(window.confirm).toHaveBeenCalled();
    expect(dataService.reset).toHaveBeenCalled();
    expect(toastService.show).toHaveBeenCalledWith(
      'Datos del portafolio restaurados a valores iniciales.',
      'success'
    );
  });

  it('should NOT call dataService.reset when the reset button is clicked but not confirmed', () => {
    // Arrange: Spy on window.confirm and make it return false
    spyOn(window, 'confirm').and.returnValue(false);
    const resetButton = fixture.debugElement.query(By.css('button'));

    // Act: Simulate a click
    resetButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Assert
    expect(window.confirm).toHaveBeenCalled();
    expect(dataService.reset).not.toHaveBeenCalled();
    expect(toastService.show).not.toHaveBeenCalled();
  });
});