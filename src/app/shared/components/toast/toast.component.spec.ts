import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return empty string for background color if state is null', () => {
    component.state = null;
    expect(component.backgroundColor).toBe('');
  });

  it('should return green background for success type', () => {
    component.state = { message: 'Ok', type: 'success' };
    expect(component.backgroundColor).toBe('bg-green-500');
  });

  it('should return red background for error type', () => {
    component.state = { message: 'Fail', type: 'error' };
    expect(component.backgroundColor).toBe('bg-red-500');
  });
});