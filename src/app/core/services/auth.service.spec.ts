import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { provideRouter } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  // Configuración estándar para la mayoría de tests (sin token previo)
  const configureModule = () => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([]) // Proveedor moderno para router en tests
      ]
    });
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  };

  beforeEach(() => {
    localStorage.clear(); // Empezamos limpios por defecto
  });

  describe('Basic operations', () => {
    beforeEach(() => {
      configureModule();
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be logged out by default when no token is in localStorage', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should emit true, set token, and update isAuthenticated on valid credentials', fakeAsync(() => {
      let authStatus = false;
      service.isLoggedIn$.subscribe(status => authStatus = status);

      service.login({ user: 'admin', pass: 'admin123' }).subscribe();
      tick(1500); // Simular delay

      expect(authStatus).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(localStorage.getItem('token')).toBeTruthy();
    }));

    it('should throw error on invalid credentials', fakeAsync(() => {
      service.login({ user: 'invalid', pass: 'user' }).subscribe({
        next: () => fail('Expected login to fail'),
        error: (err) => expect(err.message).toContain('Invalid credentials')
      });
      tick(1500);

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    }));
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Simulamos que ya había un login
      localStorage.setItem('token', 'fake-token');
      configureModule(); 
    });

    it('should clear token, emit false, and navigate to /login', () => {
      const navigateSpy = spyOn(router, 'navigate');
      
      service.logout();

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Initialization with existing token', () => {
    // Este test es especial: configuramos localStorage ANTES de crear el servicio
    it('should initialize as authenticated if a token exists in localStorage', () => {
      localStorage.setItem('token', 'existing-session-token');
      configureModule(); // Al inyectar aquí, el constructor leerá el token
      
      expect(service.isAuthenticated()).toBe(true);
    });
  });
});