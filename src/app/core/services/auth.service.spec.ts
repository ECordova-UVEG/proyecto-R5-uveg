import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    // Clean up local storage before each test
    localStorage.removeItem('token');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initially be logged out', (done) => {
    service.isLoggedIn$.subscribe(isLoggedIn => {
      expect(isLoggedIn).toBe(false);
      done();
    });
  });

  it('should return false for isAuthenticated() when logged out', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  describe('#login', () => {
    it('should emit true and store token on successful login', fakeAsync(() => {
      let isLoggedInStatus = false;
      service.isLoggedIn$.subscribe(status => isLoggedInStatus = status);
      
      service.login({ user: 'admin', pass: 'admin123' }).subscribe();
      tick(1500); // Advance time for the simulated delay

      expect(isLoggedInStatus).toBe(true);
      expect(localStorage.getItem('token')).toBe('dummy-auth-token-xyz');
    }));

    it('should throw an error and emit false on failed login', fakeAsync(() => {
      let isLoggedInStatus = true;
      service.isLoggedIn$.subscribe(status => isLoggedInStatus = status);

      service.login({ user: 'wrong', pass: 'user' }).subscribe({
        error: (err) => {
          expect(err.message).toContain('Invalid credentials');
        }
      });
      tick(1500);

      expect(isLoggedInStatus).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    }));
  });

  describe('#logout', () => {
    it('should clear token, emit false, and navigate to login', () => {
      // First, log in to set the state
      localStorage.setItem('token', 'dummy-token');
      service = new AuthService(); // Re-instantiate to pick up the token
      const navigateSpy = spyOn(router, 'navigate');

      let isLoggedInStatus = true;
      service.isLoggedIn$.subscribe(status => isLoggedInStatus = status);

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(isLoggedInStatus).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  it('should restore logged-in state from localStorage on construction', () => {
    localStorage.setItem('token', 'existing-token');
    const newAuthService = new AuthService();
    expect(newAuthService.isAuthenticated()).toBe(true);
  });
});