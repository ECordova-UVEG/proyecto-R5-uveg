import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.login and navigate on successful submission', fakeAsync(() => {
    // Arrange
    authService.login.and.returnValue(of(true));
    component.loginForm.setValue({ username: 'admin', password: 'admin123' });

    // Act
    component.onSubmit();
    tick(); // Simulate the passage of time for async operations like finalize

    // Assert
    expect(authService.login).toHaveBeenCalledWith({ user: 'admin', pass: 'admin123' });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should display an error message on failed login', fakeAsync(() => {
    // Arrange
    authService.login.and.returnValue(throwError(() => new Error('Invalid credentials')));
    component.loginForm.setValue({ username: 'wrong', password: 'user' });

    // Act
    component.onSubmit();
    tick();
    fixture.detectChanges();

    // Assert
    expect(authService.login).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Credenciales incorrectas.');
  }));

  it('should not submit if the form is invalid', () => {
    // Arrange
    component.loginForm.setValue({ username: '', password: '' });

    // Act
    component.onSubmit();

    // Assert
    expect(authService.login).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('Por favor, completa todos los campos');
  });
});