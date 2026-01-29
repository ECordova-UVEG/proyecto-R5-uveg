import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MarketDataService } from './market-data.service';

describe('MarketDataService', () => {
  let service: MarketDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MarketDataService]
    });
    service = TestBed.inject(MarketDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure that there are no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getRealTimePrices', () => {
    it('should return an array of quotes on success', (done) => {
      const mockTickers = ['AAPL', 'TSLA'];
      const mockResponse = [{ symbol: 'AAPL', price: 150 }, { symbol: 'TSLA', price: 250 }];
      
      service.getRealTimePrices(mockTickers).subscribe(prices => {
        expect(prices.length).toBe(2);
        expect(prices).toEqual(mockResponse);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/quote/AAPL,TSLA'));
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return an empty array if the API call fails', (done) => {
      const mockTickers = ['FAIL'];

      service.getRealTimePrices(mockTickers).subscribe(prices => {
        expect(prices).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/quote/FAIL'));
      req.flush('Error', { status: 500, statusText: 'Server Error' });
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
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return fallback currency data if the API call fails', (done) => {
      service.getCurrencies().subscribe(currencies => {
        expect(currencies.USD).toBeDefined();
        expect(currencies.EUR).toBeDefined();
        // Check if the value is a number, indicating fallback was used.
        expect(typeof currencies.USD).toBe('number');
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/quote/USDMXN,EURMXN'));
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });
});
