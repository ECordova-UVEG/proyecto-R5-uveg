import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { httpErrorInterceptor } from './http-error.interceptor';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';

describe('httpErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should not show a global toast for financialmodelingprep.com errors', () => {
    const testUrl = 'https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=123';
    
    http.get(testUrl).subscribe({
      next: () => fail('should have failed with the 403 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toEqual(403);
      },
    });

    const req = httpMock.expectOne(testUrl);
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    // CRITICAL: Verify that the global toast handler was NOT called.
    expect(toastService.show).not.toHaveBeenCalled();
  });

  it('should show a global toast for general server errors', () => {
    const testUrl = '/api/my-data';
    
    http.get(testUrl).subscribe({
      next: () => fail('should have failed with the 500 error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toEqual(500);
      },
    });

    const req = httpMock.expectOne(testUrl);
    req.flush('Server Error', { status: 500, statusText: 'Server Error' });

    // CRITICAL: Verify that the global toast handler WAS called for a non-API error.
    expect(toastService.show).toHaveBeenCalledWith('A server error occurred. Please try again later.', 'error');
  });
});