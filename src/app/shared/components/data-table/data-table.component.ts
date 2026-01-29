import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ColumnConfig {
  key: string;
  label: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() columns: ColumnConfig[] = [];
  @Output() action = new EventEmitter<any>();

  onActionButtonClick(item: any) {
    this.action.emit(item);
  }

  // Helper to get nested property
  getProperty(obj: any, path: string) {
    return path.split('.').reduce((o, p) => o && o[p], obj);
  }
}
