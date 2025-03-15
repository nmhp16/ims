import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ItemService } from '../../services/item.service';
import { Chart, ChartConfiguration } from 'chart.js';

interface Item {
  id?: number;
  name: string;
  quantity: number;
  price: number;
  brand: string;
  serialNumber: string;
}

interface DashboardStats {
  totalItems: number;
  lowStock: number;
  totalValue: number;
  averagePrice: number;
}

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ItemsComponent implements OnInit, AfterViewInit {
  @ViewChild('stockChart') stockChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('valueChart') valueChart!: ElementRef<HTMLCanvasElement>;

  items: Item[] = [];
  totalPrice = 0;
  searchTerm = '';
  dashboardStats: DashboardStats = {
    totalItems: 0,
    lowStock: 0,
    totalValue: 0,
    averagePrice: 0
  };
  
  newItem: Item = this.getEmptyItem();
  editingItem: Item | null = null;

  private stockChartInstance: Chart | null = null;
  private valueChartInstance: Chart | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private itemService: ItemService
  ) {}

  ngOnInit() {
    this.loadItems();
  }

  ngAfterViewInit() {
    this.initializeCharts();
  }

  getLowStockCount(): number {
    return this.items.filter(item => item.quantity < 5).length;
  }

  getTotalValue(): number {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getAveragePrice(): number {
    const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    return totalItems > 0 ? this.getTotalValue() / totalItems : 0;
  }

  private getEmptyItem(): Item {
    return {
      name: '',
      quantity: 0,
      price: 0,
      brand: '',
      serialNumber: ''
    };
  }

  loadItems() {
    this.itemService.getItems().subscribe({
      next: (items) => {
        this.items = items;
        this.calculateTotalPrice();
        this.updateDashboardStats();
        this.updateCharts();
      },
      error: (error) => {
        console.error('Error loading items:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  private updateDashboardStats() {
    this.dashboardStats = {
      totalItems: this.items.reduce((sum, item) => sum + item.quantity, 0),
      lowStock: this.getLowStockCount(),
      totalValue: this.getTotalValue(),
      averagePrice: this.getAveragePrice()
    };
  }

  private async initializeCharts() {
    if (typeof window !== 'undefined') {
      await import('chart.js/auto');
      this.initializeStockChart();
      this.initializeValueChart();
    }
  }

  private initializeStockChart() {
    const ctx = this.stockChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Stock Levels',
          data: [],
          backgroundColor: '#3182ce',
          borderColor: '#2c5282',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: 11
              }
            }
          },
          x: {
            ticks: {
              font: {
                size: 11
              },
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    };

    this.stockChartInstance = new Chart(ctx, config);
  }

  private initializeValueChart() {
    const ctx = this.valueChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#3182ce',
            '#38a169',
            '#805ad5',
            '#d53f8c',
            '#d69e2e'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 11
              },
              boxWidth: 12
            }
          }
        }
      }
    };

    this.valueChartInstance = new Chart(ctx, config);
  }

  private updateCharts() {
    this.updateStockChart();
    this.updateValueChart();
  }

  private updateStockChart() {
    if (!this.stockChartInstance) return;

    const sortedItems = [...this.items].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    
    this.stockChartInstance.data.labels = sortedItems.map(item => item.name);
    this.stockChartInstance.data.datasets[0].data = sortedItems.map(item => item.quantity);
    this.stockChartInstance.update();
  }

  private updateValueChart() {
    if (!this.valueChartInstance) return;

    const sortedItems = [...this.items]
      .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
      .slice(0, 5);

    this.valueChartInstance.data.labels = sortedItems.map(item => item.name);
    this.valueChartInstance.data.datasets[0].data = sortedItems.map(item => item.price * item.quantity);
    this.valueChartInstance.update();
  }

  addItem() {
    if (this.validateItem(this.newItem)) {
      this.itemService.addItem(this.newItem).subscribe({
        next: () => {
          this.loadItems();
          this.newItem = this.getEmptyItem();
        },
        error: (error) => console.error('Error adding item:', error)
      });
    }
  }

  deleteItem(item: Item) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.itemService.deleteItem(item.id!).subscribe({
        next: () => this.loadItems(),
        error: (error) => console.error('Error deleting item:', error)
      });
    }
  }

  editItem(item: Item) {
    this.editingItem = { ...item };
  }

  updateItem() {
    if (this.editingItem && this.validateItem(this.editingItem)) {
      this.itemService.updateItem(this.editingItem).subscribe({
        next: () => {
          this.loadItems();
          this.cancelEdit();
        },
        error: (error) => console.error('Error updating item:', error)
      });
    }
  }

  cancelEdit() {
    this.editingItem = null;
  }

  searchItems() {
    if (this.searchTerm.trim()) {
      this.items = this.items.filter(item =>
        item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.loadItems();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private calculateTotalPrice() {
    this.totalPrice = this.getTotalValue();
  }

  private validateItem(item: Item): boolean {
    return !!(
      item.name &&
      item.quantity >= 0 &&
      item.price >= 0 &&
      item.brand &&
      item.serialNumber
    );
  }
}
