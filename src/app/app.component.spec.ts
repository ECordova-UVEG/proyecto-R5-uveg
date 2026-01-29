import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ToastService } from './shared/services/toast.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule, // Provides a spy for the router-outlet
        ToastComponent
      ],
      providers: [ToastService]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'invest-core' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('invest-core');
  });

  it('should render the router-outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Check for the presence of the router-outlet component, which is the shell's main job.
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('should not contain any direct business logic (e.g., data fetching methods)', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance as any; // Cast to any to check for methods that shouldn't be there
    
    // This is a conceptual test. We check that methods specific to other services/components are not present.
    expect(app.fetchMarketData).toBeUndefined();
    expect(app.getPortfolioData).toBeUndefined();
    expect(app.executeTransaction).toBeUndefined();
  });
});