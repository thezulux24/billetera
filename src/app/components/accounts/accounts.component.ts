import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Account } from '../../models/finance.models';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, RouterLink, BottomNavComponent],
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
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Mis Cuentas</h1>
            <button 
              (click)="createAccount()"
              class="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="Crear nueva cuenta"
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
        <!-- Total Balance Card -->
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white mb-6">
          <div class="text-center">
            <p class="text-blue-100 text-sm mb-2">Balance Total</p>
            <h2 class="text-3xl font-bold">
              {{ formatCurrency(getTotalBalance()) }}
            </h2>
            <p class="text-blue-100 text-sm mt-2">
              {{ accounts.length }} {{ accounts.length === 1 ? 'cuenta' : 'cuentas' }}
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="animate-pulse space-y-4">
          <div class="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" *ngFor="let item of [1,2,3]"></div>
        </div>

        <!-- Accounts List -->
        <div class="space-y-4" *ngIf="!isLoading && accounts.length > 0">
          <div 
            *ngFor="let account of accounts"
            class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div 
                  class="w-12 h-12 rounded-full flex items-center justify-center"
                  [style.backgroundColor]="account.color"
                >
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ account.name }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">{{ getAccountTypeName(account.type) }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold text-lg text-gray-900 dark:text-white">
                  {{ formatCurrency(account.balance) }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ account.currency }}</p>
              </div>
            </div>
            
            <!-- Account Actions -->
            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-600">
              <div class="grid grid-cols-3 gap-2">
                <button 
                  routerLink="/add-transaction"
                  [queryParams]="{type: 'income', account: account.id}"
                  class="flex items-center justify-center px-3 py-2 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Ingreso
                </button>
                <button 
                  routerLink="/add-transaction"
                  [queryParams]="{type: 'expense', account: account.id}"
                  class="flex items-center justify-center px-3 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                  </svg>
                  Gasto
                </button>
                <button class="flex items-center justify-center px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && accounts.length === 0" class="text-center py-12">
          <div class="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No tienes cuentas</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            Crea tu primera cuenta para empezar a gestionar tu dinero
          </p>
          <button 
            routerLink="/accounts/create"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transform hover:scale-105 transition-all shadow-lg"
          >
            Crear Primera Cuenta
          </button>
        </div>

        <!-- Error State -->
        <div *ngIf="errorMessage" class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p class="text-red-800 dark:text-red-200">{{ errorMessage }}</p>
          <button 
            (click)="loadAccounts()" 
            class="mt-2 text-red-600 dark:text-red-400 font-medium"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>

      <!-- Bottom Navigation -->
      <app-bottom-nav></app-bottom-nav>
    </div>
  `
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.loadAccounts();
  }

  async loadAccounts() {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      this.accounts = await this.supabaseService.getAccounts();
    } catch (error: any) {
      this.errorMessage = 'Error al cargar cuentas: ' + error.message;
      console.error('Error loading accounts:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getTotalBalance(): number {
    return this.accounts.reduce((sum, account) => sum + account.balance, 0);
  }

  getAccountTypeName(type: string): string {
    const types: Record<string, string> = {
      'bank': 'Cuenta Bancaria',
      'cash': 'Efectivo',
      'credit_card': 'Tarjeta de Crédito',
      'debit_card': 'Tarjeta de Débito',
      'savings': 'Cuenta de Ahorros'
    };
    return types[type] || type;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  createAccount() {
    this.router.navigate(['/accounts/create']);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}