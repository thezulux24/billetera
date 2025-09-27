import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Transaction } from '../../models/finance.models';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, BottomNavComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 shadow-sm">
        <div class="px-4 py-4">
          <div class="flex items-center justify-between">
            <button (click)="goBack()" class="p-2 -ml-2 rounded-lg">
              <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Todas las Transacciones</h1>
            <button 
              (click)="addTransaction()"
              class="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="Agregar transacción"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-4 py-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <div class="text-center">
              <p class="text-green-600 dark:text-green-400 text-sm font-medium">Ingresos</p>
              <p class="text-xl font-bold text-green-700 dark:text-green-300">
                {{ formatCurrency(totalIncome) }}
              </p>
            </div>
          </div>
          <div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
            <div class="text-center">
              <p class="text-red-600 dark:text-red-400 text-sm font-medium">Gastos</p>
              <p class="text-xl font-bold text-red-700 dark:text-red-300">
                {{ formatCurrency(totalExpenses) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Filter Buttons -->
        <div class="flex space-x-2 mb-4">
          <button 
            (click)="filterType = 'all'"
            [class]="filterType === 'all' ? 
              'bg-blue-500 text-white' : 
              'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
            class="px-4 py-2 rounded-lg text-sm font-medium"
          >
            Todas
          </button>
          <button 
            (click)="filterType = 'income'"
            [class]="filterType === 'income' ? 
              'bg-green-500 text-white' : 
              'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
            class="px-4 py-2 rounded-lg text-sm font-medium"
          >
            Ingresos
          </button>
          <button 
            (click)="filterType = 'expense'"
            [class]="filterType === 'expense' ? 
              'bg-red-500 text-white' : 
              'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
            class="px-4 py-2 rounded-lg text-sm font-medium"
          >
            Gastos
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="animate-pulse space-y-3">
          <div class="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" *ngFor="let item of [1,2,3,4,5]"></div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="text-center py-8">
          <div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-4">
            <p class="text-red-600 dark:text-red-400">{{ error }}</p>
          </div>
          <button 
            (click)="loadTransactions()" 
            class="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>

        <!-- Transactions List -->
        <div *ngIf="!isLoading && !error">
          <div class="space-y-3" *ngIf="filteredTransactions.length > 0; else noTransactions">
            <div 
              *ngFor="let transaction of filteredTransactions"
              class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center"
                    [ngClass]="{
                      'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400': transaction.type === 'income',
                      'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400': transaction.type === 'expense'
                    }"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        *ngIf="transaction.type === 'income'"
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                      <path 
                        *ngIf="transaction.type === 'expense'"
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M19 13l-7 7-7-7m14-8l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ transaction.description }}
                    </p>
                    <div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span *ngIf="transaction.category">{{ transaction.category.name }}</span>
                      <span *ngIf="transaction.account">• {{ transaction.account.name }}</span>
                      <span>• {{ formatDate(transaction.date) }}</span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p 
                    class="font-semibold"
                    [ngClass]="{
                      'text-green-600 dark:text-green-400': transaction.type === 'income',
                      'text-red-600 dark:text-red-400': transaction.type === 'expense'
                    }"
                  >
                    {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ng-template #noTransactions>
            <div class="text-center py-12">
              <div class="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <p class="text-gray-500 dark:text-gray-400 mb-3">No hay transacciones aún</p>
              <button 
                (click)="addTransaction()"
                class="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium"
              >
                Agregar Primera Transacción
              </button>
            </div>
          </ng-template>
        </div>

        <!-- Load More Button -->
        <div *ngIf="hasMoreTransactions && !isLoading" class="text-center mt-6">
          <button 
            (click)="loadMoreTransactions()"
            class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium"
          >
            Cargar Más
          </button>
        </div>
      </div>

      <app-bottom-nav></app-bottom-nav>
    </div>
  `
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  isLoading = true;
  error = '';
  filterType: 'all' | 'income' | 'expense' = 'all';
  hasMoreTransactions = false;
  currentOffset = 0;
  readonly LIMIT = 20;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTransactions();
  }

  async loadTransactions(reset = true) {
    try {
      this.isLoading = true;
      this.error = '';

      if (reset) {
        this.currentOffset = 0;
        this.transactions = [];
      }

      const newTransactions = await this.supabaseService.getTransactions(
        this.LIMIT, 
        this.currentOffset
      );

      if (reset) {
        this.transactions = newTransactions;
      } else {
        this.transactions = [...this.transactions, ...newTransactions];
      }

      this.hasMoreTransactions = newTransactions.length === this.LIMIT;
      this.currentOffset += newTransactions.length;

    } catch (error: any) {
      this.error = 'Error al cargar las transacciones: ' + (error?.message || 'Error desconocido');
      console.error('Error loading transactions:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadMoreTransactions() {
    await this.loadTransactions(false);
  }

  get filteredTransactions(): Transaction[] {
    if (this.filterType === 'all') {
      return this.transactions;
    }
    return this.transactions.filter(t => t.type === this.filterType);
  }

  get totalIncome(): number {
    return this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalExpenses(): number {
    return this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  addTransaction() {
    this.router.navigate(['/add-transaction']);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}