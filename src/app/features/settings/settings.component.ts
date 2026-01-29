import { Component, inject } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private dataService = inject(DataService);
  private toastService = inject(ToastService);

  /**
   * Resets all portfolio data to its initial seed state after user confirmation.
   * Displays a success toast notification upon successful data reset.
   */
  resetData(): void {
    if (confirm('¿Estás seguro de que quieres borrar todos los datos del portafolio y restaurar los datos iniciales? Esta acción es irreversible.')) {
      this.dataService.reset(); // Assuming DataService has a reset method
      this.toastService.show('Datos del portafolio restaurados a valores iniciales.', 'success');
    }
  }
}