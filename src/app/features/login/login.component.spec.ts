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
    // IMPORTANTE: Usamos valores que pasen tus validadores (ej. minLength)
    component.loginForm.setValue({ username: 'adminUser', password: 'password123' });

    // Act
    component.onSubmit();
    tick(); // Esperar a que se complete el observable

    // Assert
    expect(authService.login).toHaveBeenCalledWith({ user: 'adminUser', pass: 'password123' });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should display an error message on failed login', fakeAsync(() => {
    // Arrange: El servicio devuelve error
    authService.login.and.returnValue(throwError(() => new Error('Invalid credentials')));
    
    // IMPORTANTE: El formulario DEBE ser válido para que intente llamar al login
    component.loginForm.setValue({ username: 'validUser', password: 'validPassword' });

    // Act
    component.onSubmit();
    tick(); // Esperar respuesta del servicio
    fixture.detectChanges(); // Actualizar el HTML para mostrar el error

    // Assert
    expect(authService.login).toHaveBeenCalled(); // Ahora sí debe llamarse
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Credenciales incorrectas.');
  }));

  it('should not submit if the form is invalid', () => {
    // Arrange: Campos vacíos (Inválido)
    component.loginForm.setValue({ username: '', password: '' });

    // Act
    component.onSubmit();

    // Assert
    expect(authService.login).not.toHaveBeenCalled();
    // Aquí esperamos el mensaje de validación local, no el del backend
    expect(component.errorMessage).toContain('Por favor, completa todos los campos');
  });
});