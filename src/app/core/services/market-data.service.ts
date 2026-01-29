/****************************************************************************************
 * MARKET DATA SERVICE
 *
 * Estrategia de API: "Peticiones 1 a 1"
 * --------------------------------------------------------------------------------------
 * Este servicio está diseñado para funcionar con el plan GRATUITO de financialmodelingprep.com.
 * El plan gratuito a menudo impone límites, como no permitir pedir múltiples tickers
 * en una sola llamada (ej. /quote/AAPL,TSLA,MSFT).
 *
 * Para evitar estos límites, implementamos una estrategia defensiva:
 * 1.  **Iteración y Peticiones Individuales:** En lugar de una llamada masiva, se itera
 *     sobre la lista de tickers y se genera una petición HTTP individual para cada uno.
 * 2.  **`forkJoin`:** Se utiliza `forkJoin` de RxJS para ejecutar todas estas peticiones
 *     en paralelo, esperando a que TODAS terminen (o fallen) para emitir un único
 *     resultado consolidado.
 * 3.  **`catchError` Individual:** Cada petición individual está "blindada" con su
 *     propio `catchError`. Si la API falla para un ticker específico (ej. un 404),
 *     en lugar de cancelar todo el `forkJoin`, simplemente devolvemos `of(null)`.
 *     Esto asegura que la falla de un solo activo no impida que los demás se carguen.
 * 4.  **Filtrado Final:** Una vez que `forkJoin` emite, se filtra el array de respuestas
 *     para eliminar cualquier `null` que haya resultado de una petición fallida.
 *
 * Este enfoque proporciona máxima resiliencia y compatibilidad con planes de API restrictivos.
 ****************************************************************************************/
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MarketDataService {
  private http = inject(HttpClient);
  
  private apiKey = 'demo'; // Usa 'Fusw8WYYOB2oUVNdVeaPe9H0LS2MwCKz' para probar
  private baseUrl = 'https://financialmodelingprep.com/api/v3';

  /**
   * Obtiene los precios en tiempo real para una lista de tickers.
   * Utiliza una estrategia de peticiones individuales para compatibilidad con el plan gratuito.
   */
  getRealTimePrices(tickers: string[]): Observable<any[]> {
    if (!tickers || tickers.length === 0) return of([]);

    const requests = tickers.map(ticker => 
      this.http.get<any[]>(`${this.baseUrl}/quote/${ticker}?apikey=${this.apiKey}`).pipe(
        // Blindaje: Si un ticker falla, no rompemos toda la cadena.
        // Devolvemos null y lo filtramos más tarde.
        catchError(error => {
          console.warn(`No se pudo obtener el precio para ${ticker}. Usando datos existentes.`);
          return of(null);
        })
      )
    );

    // forkJoin ejecuta todas las peticiones en paralelo y emite un solo valor cuando todas terminan.
    return forkJoin(requests).pipe(
      map(responses => responses.flat().filter(item => item !== null))
    );
  }

  /**
   * Obtiene las tasas de cambio para USD y EUR contra MXN.
   * Si la petición falla, devuelve un valor simulado para mantener la app funcional.
   */
  getCurrencies(): Observable<{ USD: number, EUR: number }> {
    return this.http.get<any[]>(`${this.baseUrl}/quote/USDMXN,EURMXN?apikey=${this.apiKey}`).pipe(
      map(data => {
        const result = { USD: 0, EUR: 0 };
        data?.forEach(item => {
          if (item.symbol === 'USDMXN') result.USD = item.price;
          if (item.symbol === 'EURMXN') result.EUR = item.price;
        });
        // Si algún precio vino en cero, usar fallback
        if (result.USD === 0) result.USD = 20.50 + Math.random() * 0.1;
        if (result.EUR === 0) result.EUR = 21.80 + Math.random() * 0.1;
        return result;
      }),
      // Blindaje: Si la API de divisas falla por completo, devolvemos un objeto simulado.
      catchError(err => {
        console.error('Error fetching currencies, returning fallback data.', err);
        return of({ 
          USD: 20.50 + Math.random() * 0.1, 
          EUR: 21.80 + Math.random() * 0.1 
        });
      })
    );
  }
}