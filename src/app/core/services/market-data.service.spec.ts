import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MarketDataService } from './market-data.service';

describe('MarketDataService', () => {
  let service: MarketDataService;
  let httpMock: HttpTestingController;

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
  });

  afterEach(() => {
    // Verifica que no haya peticiones pendientes (crucial para forkJoin)
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
        // Verificamos contenido sin importar el orden
        expect(prices).toContain(jasmine.objectContaining({ symbol: 'AAPL' }));
        expect(prices).toContain(jasmine.objectContaining({ symbol: 'TSLA' }));
        done();
      });

      // CAMBIO: Ahora buscamos el query param ?symbol=
      const reqAapl = httpMock.expectOne(req => req.url.includes('symbol=AAPL'));
      const reqTsla = httpMock.expectOne(req => req.url.includes('symbol=TSLA'));
      
      expect(reqAapl.request.method).toBe('GET');
      expect(reqTsla.request.method).toBe('GET');

      // Respondemos a cada una individualmente
      reqAapl.flush(mockAaplResponse);
      reqTsla.flush(mockTslaResponse);
    });

    it('should filter out results for tickers that fail', (done) => {
      const mockTickers = ['AAPL', 'FAIL'];
      const mockAaplResponse = [{ symbol: 'AAPL', price: 150 }];

      service.getRealTimePrices(mockTickers).subscribe(prices => {
        // Solo debe devolver el resultado de la petición exitosa (1)
        expect(prices.length).toBe(1);
        expect(prices[0].symbol).toBe('AAPL');
        done();
      });

      const reqAapl = httpMock.expectOne(req => req.url.includes('symbol=AAPL'));
      const reqFail = httpMock.expectOne(req => req.url.includes('symbol=FAIL'));

      reqAapl.flush(mockAaplResponse);
      
      // Simulamos error en la segunda petición
      reqFail.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('#getCurrencies', () => {
    it('should make 2 separate requests and map currency data on success', (done) => {
      // Mock de respuestas individuales (Array de 1 elemento cada una)
      const mockUsdResponse = [{ symbol: 'USDMXN', price: 20.5 }];
      const mockEurResponse = [{ symbol: 'EURMXN', price: 22.1 }];

      service.getCurrencies().subscribe(currencies => {
        expect(currencies.USD).toBe(20.5);
        expect(currencies.EUR).toBe(22.1);
        done();
      });

      // CAMBIO CRÍTICO: Ahora esperamos 2 peticiones separadas, NO una con coma
      const reqUsd = httpMock.expectOne(req => req.url.includes('symbol=USDMXN'));
      const reqEur = httpMock.expectOne(req => req.url.includes('symbol=EURMXN'));

      expect(reqUsd.request.method).toBe('GET');
      expect(reqEur.request.method).toBe('GET');

      // Respondemos individualmente
      reqUsd.flush(mockUsdResponse);
      reqEur.flush(mockEurResponse);
    });

    it('should return fallback data if API calls fail', (done) => {
      service.getCurrencies().subscribe(currencies => {
        // Validamos que retornó datos numéricos (del fallback aleatorio)
        expect(currencies.USD).toBeGreaterThan(0);
        expect(currencies.EUR).toBeGreaterThan(0);
        done();
      });

      const reqUsd = httpMock.expectOne(req => req.url.includes('symbol=USDMXN'));
      const reqEur = httpMock.expectOne(req => req.url.includes('symbol=EURMXN'));

      // Simulamos fallo total
      reqUsd.flush('Error', { status: 500, statusText: 'Server Error' });
      reqEur.flush('Error', { status: 500, statusText: 'Server Error' });
    });

    it('should handle partial failure (one currency fails)', (done) => {
        service.getCurrencies().subscribe(currencies => {
          // USD viene de la API, EUR viene del fallback (random > 0)
          expect(currencies.USD).toBe(19.5);
          expect(currencies.EUR).toBeGreaterThan(0); 
          done();
        });
  
        const reqUsd = httpMock.expectOne(req => req.url.includes('symbol=USDMXN'));
        const reqEur = httpMock.expectOne(req => req.url.includes('symbol=EURMXN'));
  
        // USD Éxito
        reqUsd.flush([{ symbol: 'USDMXN', price: 19.5 }]);
        // EUR Fallo
        reqEur.flush('Error', { status: 500, statusText: 'Server Error' });
      });
  });
});