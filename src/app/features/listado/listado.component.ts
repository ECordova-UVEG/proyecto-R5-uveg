import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { DataService, Investment, PortfolioSummary } from '../../core/services/data.service';
import { FormsModule } from '@angular/forms';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { TransactionModalComponent } from '../../shared/components/transaction-modal/transaction-modal.component';

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyFormatPipe, SkeletonComponent, PercentPipe, TransactionModalComponent],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.scss'
})
export class ListadoComponent implements OnInit {
  protected Math = Math;
  private dataService = inject(DataService);

  isLoading = signal(true);
  investments: Investment[] = [];
  filteredInvestments: Investment[] = [];
  summary: PortfolioSummary | null = null;
  private fullSummary: PortfolioSummary | null = null;

  filterValue = '';
  selectedAsset: Investment | null = null;
  showTradeModal = false;
  tradeTicker = '';
  tradeType: 'BUY' | 'SELL' = 'BUY';

  // Category Filters
  categories: string[] = ['Todos'];
  selectedCategory: string = 'Todos';

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;

  get paginatedAssets(): Investment[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredInvestments.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get emptyRows(): number[] {
    const missing = this.itemsPerPage - (this.paginatedAssets?.length || 0);
    return missing > 0 ? new Array(missing).fill(0) : [];
  }

  ngOnInit() {
    this.dataService.getPortfolioData()
      .subscribe({
        next: (data) => {
          if (data) {
            this.investments = data.assets;
            this.summary = data.summary;
            this.fullSummary = data.summary;

            const uniqueTypes = [...new Set(this.investments.map(inv => inv.type))];
            this.categories = ['Todos', ...uniqueTypes];

            this.filterData();
            setTimeout(() => this.isLoading.set(false), 500); // Pequeño delay para ver el skeleton
          }
        },
        error: (e) => {
          console.error(e);
          this.isLoading.set(false);
        }
      });
  }

  filterData() {
    this.currentPage = 1;

    let categoryFiltered = this.investments;
    if (this.selectedCategory !== 'Todos') {
      categoryFiltered = this.investments.filter(inv => inv.type === this.selectedCategory);
    }

    this.filteredInvestments = categoryFiltered.filter(inv =>
      inv.ticker.toLowerCase().includes(this.filterValue.toLowerCase()) ||
      inv.name.toLowerCase().includes(this.filterValue.toLowerCase())
    );

    if (this.selectedCategory === 'Todos' && this.filterValue === '') {
      this.summary = this.fullSummary;
    } else {
      this.summary = this.calculateSummary(this.filteredInvestments);
    }
  }

  private calculateSummary(assets: Investment[]): PortfolioSummary {
    if (!assets || assets.length === 0) {
      return { totalValue: 0, totalGainLoss: 0, totalYieldPct: 0, allocation: {} };
    }

    const totalValue = assets.reduce((sum, asset) => sum + (asset.marketValue || 0), 0);
    const totalGainLoss = assets.reduce((sum, asset) => sum + (asset.gainLoss || 0), 0);
    const totalCostBasis = assets.reduce((sum, asset) => sum + (asset.avg_cost * asset.quantity), 0);
    const totalYieldPct = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) : 0;

    const allocation: PortfolioSummary['allocation'] = {};

    assets.forEach(asset => {
      const category = asset.category || 'Unknown';
      if (!allocation[category]) {
        allocation[category] = { value: 0, percentage: 0, gainLoss: 0, yieldPct: 0 };
      }
      allocation[category].value += asset.marketValue || 0;
      allocation[category].gainLoss += asset.gainLoss || 0;
    });

    const totalAllocationValue = Object.values(allocation).reduce((sum, cat) => sum + cat.value, 0);

    for (const category in allocation) {
      allocation[category].percentage = totalAllocationValue > 0 ? (allocation[category].value / totalAllocationValue) : 0;

      const categoryAssets = assets.filter(a => a.category === category);
      const categoryCostBasis = categoryAssets.reduce((sum, a) => sum + (a.avg_cost * a.quantity), 0);
      allocation[category].yieldPct = categoryCostBasis > 0 ? (allocation[category].gainLoss / categoryCostBasis) : 0;
    }

    return { totalValue, totalGainLoss, totalYieldPct, allocation };
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.filterData();
  }

  nextPage(): void {
    if ((this.currentPage * this.itemsPerPage) < this.filteredInvestments.length) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  openModal(asset: Investment): void {
    this.selectedAsset = asset;
    document.body.style.overflow = 'hidden'; // Bloquea el scroll del body
  }

  closeModal(): void {
    this.selectedAsset = null;
    document.body.style.overflow = 'auto'; // Restaura el scroll
  }

  /**
   * Inicia una operación de compra o venta para el activo seleccionado.
   * Cierra el modal de detalle del activo y abre el modal de transacción
   * pre-rellenado con el ticker del activo y el tipo de operación (`BUY` o `SELL`).
   * @param type El tipo de transacción a iniciar ('BUY' para compra, 'SELL' para venta).
   */
  tradeFromDetail(type: 'BUY' | 'SELL') {
    if (!this.selectedAsset) return;
    this.tradeTicker = this.selectedAsset.ticker;
    this.tradeType = type;
    this.closeModal(); // Cierra el detalle del activo
    this.showTradeModal = true; // Abre el modal de trading
  }

  exportData(): void {
    const headers = ['Ticker', 'Nombre', 'Cantidad', 'Costo Promedio', 'Precio Actual', 'Valor de Mercado', 'Ganancia/Pérdida'];
    const rows = this.filteredInvestments.map(inv => [
      inv.ticker,
      inv.name,
      inv.quantity,
      inv.avg_cost,
      inv.current_price,
      inv.marketValue,
      inv.gainLoss
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'portafolio-investcore.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  objectKeys(obj: any) {
    return Object.keys(obj);
  }
}