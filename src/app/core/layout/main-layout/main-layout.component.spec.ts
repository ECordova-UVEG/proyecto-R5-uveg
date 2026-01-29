import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';
import { provideRouter } from '@angular/router';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]) // Provee el Router real pero vacío
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have sidebar closed by default', () => {
    expect(component.isSidebarOpen).toBeFalse();
  });

  it('should toggle sidebar state', () => {
    // De cerrado a abierto
    component.toggleSidebar();
    expect(component.isSidebarOpen).toBeTrue();

    // De abierto a cerrado
    component.toggleSidebar();
    expect(component.isSidebarOpen).toBeFalse();
  });

  it('should navigate to login on logout', () => {
    const navigateSpy = spyOn(router, 'navigate');
    
    component.logout();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});