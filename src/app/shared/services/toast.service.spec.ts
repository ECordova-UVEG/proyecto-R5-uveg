import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService]
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show toast update the signal state', () => {
    service.show('Test Message', 'success');
    
    const state = service.toastState();
    expect(state).not.toBeNull();
    expect(state?.message).toBe('Test Message');
    expect(state?.type).toBe('success');
  });

  it('should hide toast manually', () => {
    service.show('Test', 'error');
    service.hide();
    expect(service.toastState()).toBeNull();
  });

  it('should auto-hide toast after 3 seconds', fakeAsync(() => {
    service.show('Auto hide test', 'success');
    expect(service.toastState()).not.toBeNull();

    // Avanzamos el tiempo 3 segundos
    tick(3000);

    expect(service.toastState()).toBeNull();
  }));
});