/****************************************************************************************
 * MARKET DATA SERVICE
 *
 * Responsabilidad: Interactuar con la API externa de datos de mercado (Financial Modeling Prep).
 *
 * Estrategia de API: "Peticiones 1 a 1"
 * --------------------------------------------------------------------------------------
 * Este servicio está diseñado para funcionar con el plan GRATUITO de la API, que a menudo
 * impone límites y no permite peticiones masivas (ej. /quote/AAPL,TSLA,MSFT).
 *
 * Para solventar esto, se implementa una estrategia defensiva:
 * 1.  Peticiones Individuales: Se itera sobre los tickers y se genera una petición HTTP
 *     individual para cada uno.
 * 2.  `forkJoin`: Ejecuta todas las peticiones en paralelo y emite un único resultado
 *     consolidado cuando todas terminan.
 * 3.  `catchError` Individual: Cada petición está "blindada". Si una falla, no cancela
 *     el resto, asegurando máxima resiliencia.
 ****************************************************************************************/
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * @description
 * Servicio Singleton responsable de obtener datos de mercado en tiempo real
 * desde una API externa. Implementa estrategias de fallback para manejar errores de API.
 */
@Injectable({
  providedIn: 'root'
})
export class MarketDataService {
  private http = inject(HttpClient);
  
  private apiKey = 'Fusw8WYYOB2oUVNdVeaPe9H0LS2MwCKz';
  private baseUrl = 'https://financialmodelingprep.com/stable';

  /**
   * @description
   * Obtiene los precios en tiempo real para una lista de tickers.
   * Devuelve solo los resultados de las peticiones exitosas.
   * @param tickers - Un array de strings con los tickers a consultar (ej. ['AAPL', 'TSLA']).
   * @returns Un Observable que emite un array de objetos con los datos de precios.
   */
  getRealTimePrices(tickers: string[]): Observable<any[]> {
    if (!tickers || tickers.length === 0) {
      return of([]);
    }

    const requests = tickers.map(ticker => 
      this.http.get<any[]>(`${this.baseUrl}/quote?symbol=${ticker}&apikey=${this.apiKey}`).pipe(
        catchError(() => {
          return of(null);
        })
      )
    );

    // forkJoin ejecuta todas las peticiones en paralelo y emite un solo valor cuando todas terminan.
    return forkJoin(requests).pipe(
      map(responses => {
        return responses
          .flat()
          .filter(item => item !== null && item !== undefined);
      })
    );
  }

  /**
   * @description
   * Obtiene las tasas de cambio para USD y EUR contra MXN.
   * Si la petición a la API falla, devuelve un valor simulado para mantener la app funcional. (DATOS DUMMY)
   * @returns Un Observable que emite un objeto con las tasas de cambio (ej. { USD: 20.5, EUR: 21.8 }).
   */
  getCurrencies(): Observable<{ USD: number, EUR: number }> {
    const pairs = ['USDMXN', 'EURMXN'];

    // Generamos 2 peticiones separadas
    const requests = pairs.map(pair => 
      this.http.get<any[]>(`${this.baseUrl}/quote?symbol=${pair}&apikey=${this.apiKey}`).pipe(
        catchError((err) => {
          console.warn(`⚠️ Error obteniendo ${pair}`, err);
          return of(null);
        })
      )
    );

    return forkJoin(requests).pipe(
      map(responses => {
        // Aplanamos las respuestas (cada API call devuelve un array)
        const validData = responses
          .flat()
          .filter(item => item !== null && item !== undefined);

        const result = { USD: 0, EUR: 0 };
        
        validData.forEach(item => {
          if (item.symbol === 'USDMXN') result.USD = item.price;
          if (item.symbol === 'EURMXN') result.EUR = item.price;
        });

        // Fallback: Si no llegaron datos o llegaron en 0, usamos simulación para fines ilustrativos.
        if (!result.USD) result.USD = 20.50 + Math.random() * 0.1;
        if (!result.EUR) result.EUR = 21.80 + Math.random() * 0.1;
        
        return result;
      })
    );
  }
}
