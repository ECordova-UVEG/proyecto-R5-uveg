import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MarketDataService } from './market-data.service';

describe('MarketDataService', () => {
  let service: MarketDataService;
  let httpMock: HttpTestingController;
  let baseUrl: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MarketDataService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(MarketDataService);
    httpMock = TestBed.inject(HttpTestingController);
    // Accedemos a la URL base privada para construir las URLs esperadas
    baseUrl = (service as any).baseUrl; 
  });

  afterEach(() => {
    // Verifica que no haya peticiones pendientes al final de cada test
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getRealTimePrices', () => {
    it('should return a combined array of quotes from multiple successful calls', (done) => {
      const mockTickers = ['AAPL', 'TSLA'];
      const mockAaplResponse = [{ symbol: 'AAPL', price: 150 }];
      const mockTslaResponse = [{ symbol: 'TSLA', price: 250 }];

      service.getRealTimePrices(mockTickers).subscribe(prices => {
        expect(prices.length).toBe(2);
        // El orden puede no estar garantizado, por eso buscamos los elementos
        expect(prices).toContain(jasmine.objectContaining({ symbol: 'AAPL' }));
        expect(prices).toContain(jasmine.objectContaining({ symbol: 'TSLA' }));
        done();
      });

      // Se esperan dos peticiones separadas debido a la estrategia 1 a 1
      const reqAapl = httpMock.expectOne(req => req.url.includes('/quote/AAPL'));
      const reqTsla = httpMock.expectOne(req => req.url.includes('/quote/TSLA'));
      
      expect(reqAapl.request.method).toBe('GET');
      expect(reqTsla.request.method).toBe('GET');

      // Respondemos a cada una
      reqAapl.flush(mockAaplResponse);
      reqTsla.flush(mockTslaResponse);
    });

    it('should filter out results for tickers that fail', (done) => {
      const mockTickers = ['AAPL', 'FAIL'];
      const mockAaplResponse = [{ symbol: 'AAPL', price: 150 }];

      service.getRealTimePrices(mockTickers).subscribe(prices => {
        // Solo debe devolver el resultado de la petición exitosa
        expect(prices.length).toBe(1);
        expect(prices[0].symbol).toBe('AAPL');
        done();
      });

      const reqAapl = httpMock.expectOne(req => req.url.includes('/quote/AAPL'));
      const reqFail = httpMock.expectOne(req => req.url.includes('/quote/FAIL'));

      reqAapl.flush(mockAaplResponse);
      // Simulamos un error para la segunda petición
      reqFail.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('#getCurrencies', () => {
    it('should return mapped currency data on success', (done) => {
      const mockResponse = [
        { symbol: 'USDMXN', price: 20.5 },
        { symbol: 'EURMXN', price: 22.1 }
      ];

      service.getCurrencies().subscribe(currencies => {
        expect(currencies.USD).toBe(20.5);
        expect(currencies.EUR).toBe(22.1);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/quote/USDMXN,EURMXN'));
      req.flush(mockResponse);
    });

    it('should return fallback data if the API call fails', (done) => {
      service.getCurrencies().subscribe(currencies => {
        expect(currencies.USD).toBeGreaterThan(0);
        expect(currencies.EUR).toBeGreaterThan(0);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/quote/USDMXN,EURMXN'));
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });
});