import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import {
  ApexChart, ApexXAxis, ApexYAxis, ApexStroke, ApexFill, ApexTooltip,
  ApexDataLabels, ApexTheme, ApexLegend, ApexResponsive, ApexPlotOptions, ApexGrid
} from 'ng-apexcharts';
import { FormsModule } from '@angular/forms';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { TransactionModalComponent } from '../../shared/components/transaction-modal/transaction-modal.component';
import { MarketDataService } from '../../core/services/market-data.service';
// Removemos imports de rxjs que no se usen directamente aquí, dejamos DataService manejar la lógica pesada

// Types definitions...
export type ChartOptions = {
  series: any[]; labels: any[]; chart: ApexChart; colors: string[]; theme: ApexTheme;
  plotOptions: ApexPlotOptions; legend: ApexLegend; tooltip: ApexTooltip;
  dataLabels: ApexDataLabels; responsive: ApexResponsive[]; grid: ApexGrid;
};

export type AreaChartOptions = {
  series: any[]; chart: ApexChart; xaxis: ApexXAxis; yaxis: ApexYAxis; stroke: ApexStroke;
  fill: ApexFill; tooltip: ApexTooltip; dataLabels: ApexDataLabels; colors: string[]; grid: ApexGrid;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, NgApexchartsModule, SkeletonComponent, FormsModule, CurrencyFormatPipe, TransactionModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // =================================================================
  // Properties
  // =================================================================
  public dataService = inject(DataService);
  private marketService = inject(MarketDataService);
  
  // State Flags
  isLoading = signal(true);
  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showTradeModal = false;
  
  // Data Properties
  totalPortfolioValue: number | null = null;
  dailyGainLoss: number | null = null;
  totalAssets: number | null = null;
  public topMovers: any[] = [];
  now = new Date();
  buyingPower: number = 0;
  usdPrice: number = 0;
  eurPrice: number = 0;
  public selectedAsset: any = null;
  public isDetailOpen: boolean = false;
  
  // Trade Modal Properties
  tradeTicker = '';
  tradeType: 'BUY' | 'SELL' = 'BUY';
  
  get myAssets() {
    return this.dataService.mockData.assets || [];
  }

  // Chart Configurations
  public pieChartOptions: Partial<ChartOptions> | any = {};
  public areaChartOptions: Partial<AreaChartOptions> | any = {};
  
  private intervalId: any;

  // =================================================================
  // Constructor & Lifecycle Hooks
  // =================================================================
  ngOnInit() {
    // 1. Carga inicial de datos locales (Mock)
    // Esto asegura que el dashboard tenga datos INMEDIATAMENTE, sin esperar a la API
    this.dataService.getPortfolioData().subscribe(data => {
      if (data) {
        this.updateDashboardUI(data);
      }
    });

    // 2. Intentar actualizar con datos reales (Segundo plano)
    this.fetchMarketData();

    // Reloj
    this.intervalId = setInterval(() => {
      this.now = new Date();
    }, 1000);

    // Auto-open panel if a trade was initiated from Portfolio
    if (this.dataService.pendingTrade) {
      const trade = this.dataService.pendingTrade;
      this.openTradeModal(trade.type, trade.ticker);
      this.dataService.pendingTrade = null;
    }
  }

  fetchMarketData() {
    const tickers = this.dataService.mockData.assets.map(a => a.ticker);

    // A. Obtener Divisas
    this.marketService.getCurrencies().subscribe(currencies => {
      // Usamos operadores OR (||) para fallback seguro
      this.usdPrice = currencies?.USD || 20.50; 
      this.eurPrice = currencies?.EUR || 21.80; 

      // Actualizar servicio central
      if (this.dataService.exchangeRates) {
        this.dataService.exchangeRates.usd = this.usdPrice;
        this.dataService.exchangeRates.eur = this.eurPrice;
      }
    });

    // B. Obtener Precios de Acciones
    if (tickers.length > 0) {
      this.marketService.getRealTimePrices(tickers).subscribe(prices => {
        // Solo actualizamos si la API devolvió un array con datos reales
        if (prices && prices.length > 0) {
          console.log('✅ Mercado conectado: Precios actualizados.');
          this.dataService.updateAssetPrices(prices);
        } else {
          console.log('ℹ️ Usando datos internos (Sin conexión a API).');
        }
        
        // Finalizamos carga independientemente del resultado
        this.isLoading.set(false); 
      });
    } else {
      this.isLoading.set(false);
    }
  }

  updateDashboardUI(data: any) {
    if (!data || !data.summary) return;

    this.totalPortfolioValue = data.summary.totalValue;
    this.dailyGainLoss = data.summary.totalGainLoss;
    this.totalAssets = data.assets.length;
    this.buyingPower = data.cashBalance || 0;

    const portfolioDistribution = data.assets.reduce((acc: any, asset: any) => {
      acc[asset.type] = (acc[asset.type] || 0) + asset.marketValue;
      return acc;
    }, {});

    // Ordenar Top Movers
    this.topMovers = [...data.assets]
      .sort((a, b) => (b.yieldPct || 0) - (a.yieldPct || 0))
      .slice(0, 10);

    this.setupPieChart(portfolioDistribution);
    this.setupAreaChart();
    
    // Si no se habían desactivado loaders, hacerlo ahora
    this.isLoading.set(false);
  }
  
  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // =================================================================
  // Public Methods (UI Interaction)
  // =================================================================
  openTradeModal(type: 'BUY' | 'SELL' = 'BUY', ticker: string = ''): void {
    this.tradeType = type;
    this.tradeTicker = ticker;
    this.showTradeModal = true;
  }

  viewAssetDetail(asset: any): void {
    this.selectedAsset = asset;
    this.isDetailOpen = true;
  }

  closeDetail(): void {
    this.isDetailOpen = false;
    this.selectedAsset = null;
  }

  tradeFromDetail(type: 'BUY' | 'SELL'): void {
    if (this.selectedAsset) {
      this.closeDetail();
      this.openTradeModal(type, this.selectedAsset.ticker);
    }
  }

  handleTransactionCompletion(): void {
    this.showTradeModal = false;
    // Forzar actualización de UI tras transacción
    this.updateDashboardUI(this.dataService.mockData); 
    this.showToast('Operación registrada correctamente', 'success');
  }

  // =================================================================
  // Private Methods (Internal Setup)
  // =================================================================
  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

  private setupPieChart(distribution: { [key: string]: number }): void {
    const series = Object.values(distribution);
    const labels = Object.keys(distribution);

    this.pieChartOptions = {
      series: series,
      labels: labels,
      chart: { type: 'donut', height: 400 },
      legend: { position: 'top', horizontalAlign: 'center', labels: { colors: '#cbd5e1' } },
      dataLabels: { enabled: false },
      plotOptions: { pie: { customScale: 0.8, donut: { size: '75%' } } },
      stroke: { show: false },
      grid: { padding: { bottom: 20 } }
    };
  }

  /**
   * Configura las opciones del gráfico de área que muestra el historial del valor del portafolio.
   * Obtiene los datos del historial del `DataService` y configura el gráfico con:
   * - Datos de series (Valor Portafolio a lo largo del tiempo).
   * - Configuración del tipo de gráfico, altura, y fuente.
   * - Configuración de la barra de herramientas y funcionalidades de zoom (solo en eje X).
   * - Deshabilitación del zoom con la rueda del mouse para evitar conflictos con el scroll de la página.
   * - Estilización de trazo y relleno con gradiente.
   * - Formato de etiquetas del eje X (fecha/hora) y eje Y (moneda con 0 decimales).
   * - Estilización de la cuadrícula y el tooltip para un tema oscuro.
   */
  private setupAreaChart() {
    // Obtener historial (simulado o real)
    const history = this.dataService.getPortfolioHistory();
    this.areaChartOptions = {
      series: [{
        name: "Valor Portafolio",
        data: history.map(h => [new Date(h.date).getTime(), h.value])
      }],
      chart: {
        type: "area",
        height: 350,
        fontFamily: 'inherit', // Heredar fuente del sistema
        background: 'transparent',
        toolbar: {
          show: true, // MOSTRAR BOTONES
          tools: {
            download: false, // Ocultar botón de descarga (opcional)
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true ,
            customIcons: []
          },
          autoSelected: 'zoom'
         },
        zoom: {
          enabled: true,
          type: 'x',  // Zoom solo en el eje de tiempo (horizontal)
          autoScaleYaxis: true
        },
        // IMPORTANTE: Esto arregla el problema del scroll
        events: {
          // Deshabilitar zoom con la rueda del mouse para no bloquear el scroll de la página
          mouseWheel: { enabled: false }
         }
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 2,
        colors: ['#3b82f6'] // Azul Tailwind (blue-500)
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 100],
          colorStops: [
            { offset: 0, color: '#3b82f6', opacity: 0.4 },
            { offset: 100, color: '#3b82f6', opacity: 0 }
          ]
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: { colors: '#94a3b8' }, // slate-400
          datetimeFormatter: {
            year: 'yyyy',
            month: "MMM 'yy",
            day: 'dd MMM',
            hour: 'HH:mm'
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false } // Ocultar tooltip del eje X (redundante)
      },
      yaxis: {
        labels: {
          style: { colors: '#94a3b8' },
          // DECIMALES: Fijar a 2 decimales y formato moneda
          formatter: (val: number) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0 // En el eje Y, sobran los decimales para ahorrar espacio
            }).format(val);
          }
        }
      },
      grid: {
        borderColor: '#1e293b', // slate-800
        strokeDashArray: 4,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
        padding: { top: 0, right: 0, bottom: 0, left: 10 }
      },
      theme: { mode: 'dark' },
      tooltip: {
        theme: 'dark',
        x: { format: 'dd MMM yyyy' },
        y: {
          // DECIMALES: Aquí sí mostramos 2 decimales precisos
          formatter: (val: number) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(val);
          }
        }
      }
    } as any;
  }
}