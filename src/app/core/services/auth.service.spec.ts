import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  // Función para configurar el TestBed, permite reutilizarla
  const configureTestBed = () => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  };

  beforeEach(() => {
    // Limpiar localStorage antes de cada test para evitar estados residuales
    localStorage.removeItem('token');
    configureTestBed();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be logged out by default', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  describe('#login', () => {
    it('should authenticate and store token on valid credentials', fakeAsync(() => {
      let loggedInState = false;
      service.isLoggedIn$.subscribe(s => loggedInState = s);
      
      service.login({ user: 'admin', pass: 'admin123' }).subscribe();
      tick(1500); // Avanzar el tiempo para el delay simulado

      expect(loggedInState).toBe(true);
      expect(localStorage.getItem('token')).toBe('dummy-auth-token-xyz');
    }));

    it('should fail authentication and not store a token on invalid credentials', fakeAsync(() => {
      let loggedInState = true;
      service.isLoggedIn$.subscribe(s => loggedInState = s);

      service.login({ user: 'wrong', pass: 'user' }).subscribe({
        next: () => fail('should have failed'),
        error: (err) => expect(err.message).toContain('Invalid credentials')
      });
      tick(1500);

      expect(loggedInState).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    }));
  });

  describe('#logout', () => {
    it('should clear token, update state, and navigate to login', () => {
      // 1. Simular estado de login
      localStorage.setItem('token', 'dummy-token-to-be-removed');
      // Reconfiguramos para que el servicio se cree con el token
      configureTestBed();
      expect(service.isAuthenticated()).toBe(true);
      
      const navigateSpy = spyOn(router, 'navigate');
      let loggedInState = true;
      service.isLoggedIn$.subscribe(s => loggedInState = s);

      // 2. Ejecutar logout
      service.logout();

      // 3. Verificar resultados
      expect(localStorage.getItem('token')).toBeNull();
      expect(loggedInState).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Initialization with existing token', () => {
    beforeEach(() => {
      // Simular que ya hay un token antes de que el servicio se cree
      localStorage.setItem('token', 'pre-existing-token');
      // Reconfiguramos el TestBed para que el nuevo AuthService se cree en este contexto
      configureTestBed();
    });

    it('should restore logged-in state if a token exists in localStorage', () => {
      expect(service.isAuthenticated()).toBe(true);
    });
  });
});
