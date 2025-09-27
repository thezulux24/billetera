import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { CurrencyService } from '../../services/currency.service';
import { DashboardData, Profile } from '../../models/finance.models';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BottomNavComponent],
  template: `
    <!-- Mobile-first Dashboard -->
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 shadow-sm">
        <div class="px-4 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
                Hola {{ getUserDisplayName() }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ getCurrentDate() }}
              </p>
            </div>
            <button 
              (click)="showProfileMenu = !showProfileMenu"
              class="p-2 rounded-full bg-gray-100 dark:bg-gray-700"
            >
              <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
          </div>
          
          <!-- Profile Menu -->
          <div *ngIf="showProfileMenu" class="absolute right-4 top-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
            <div class="py-2">
              <button 
                (click)="goToProfile()" 
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Ver Perfil
              </button>
              <button 
                (click)="signOut()" 
                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="px-4 py-6 space-y-6">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="animate-pulse space-y-4">
          <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          <div class="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          <div class="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        </div>

        <!-- Dashboard Content -->
        <div *ngIf="!isLoading && dashboardData">
          <!-- Balance Total Card -->
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-blue-100 text-sm">Balance Total</p>
                <h2 class="text-3xl font-bold">
                  {{ formatCurrency(dashboardData.totalBalance) }}
                </h2>
              </div>
              <div class="bg-blue-400 bg-opacity-30 rounded-full p-3">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
              </div>
            </div>
            
            <!-- Monthly Summary -->
            <div class="flex justify-between text-sm">
              <div>
                <p class="text-blue-100">Este mes</p>
                <p class="font-semibold text-green-200">
                  +{{ formatCurrency(dashboardData.monthlyIncome) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-blue-100">Gastos</p>
                <p class="font-semibold text-red-200">
                  -{{ formatCurrency(dashboardData.monthlyExpenses) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <button 
              routerLink="/add-transaction"
              [queryParams]="{type: 'income'}"
              class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform"
            >
              <div class="flex flex-col items-center space-y-2">
                <div class="bg-green-100 dark:bg-green-900 rounded-full p-3">
                  <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">Ingreso</span>
              </div>
            </button>

            <button 
              routerLink="/add-transaction"
              [queryParams]="{type: 'expense'}"
              class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform"
            >
              <div class="flex flex-col items-center space-y-2">
                <div class="bg-red-100 dark:bg-red-900 rounded-full p-3">
                  <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">Gasto</span>
              </div>
            </button>
          </div>

          <!-- Advanced Features -->
          <div class="grid grid-cols-2 gap-4">
            <button 
              routerLink="/credit-simulator"
              class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform"
            >
              <div class="flex flex-col items-center space-y-2">
                <div class="bg-purple-100 dark:bg-purple-900 rounded-full p-3">
                  <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">Simulador</span>
              </div>
            </button>

            <button 
              routerLink="/ai-assistant"
              class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform"
            >
              <div class="flex flex-col items-center space-y-2">
                <div class="bg-violet-100 dark:bg-violet-900 rounded-full p-3">
                  <svg class="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">IA Financiera</span>
              </div>
            </button>
          </div>

          <!-- Accounts Section -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Mis Cuentas</h3>
              <button routerLink="/accounts" class="text-blue-600 dark:text-blue-400 text-sm font-medium">
                Ver todas
              </button>
            </div>
            
            <div class="space-y-3" *ngIf="dashboardData.accounts.length > 0; else noAccounts">
              <div 
                *ngFor="let account of dashboardData.accounts.slice(0, 3)" 
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <div class="flex items-center space-x-3">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center"
                    [style.backgroundColor]="account.color"
                  >
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ account.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">{{ account.type }}</p>
                  </div>
                </div>
                <p class="font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(account.balance) }}
                </p>
              </div>
            </div>

            <ng-template #noAccounts>
              <div class="text-center py-6">
                <p class="text-gray-500 dark:text-gray-400 mb-3">No tienes cuentas aún</p>
                <button routerLink="/accounts/create" class="text-blue-600 dark:text-blue-400 font-medium">
                  Agregar primera cuenta
                </button>
              </div>
            </ng-template>
          </div>

          <!-- Recent Transactions -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Transacciones Recientes</h3>
              <button routerLink="/transactions" class="text-blue-600 dark:text-blue-400 text-sm font-medium">
                Ver todas
              </button>
            </div>
            
            <div class="space-y-3" *ngIf="dashboardData.recentTransactions.length > 0; else noTransactions">
              <div 
                *ngFor="let transaction of dashboardData.recentTransactions.slice(0, 5)"
                class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div class="flex items-center space-x-3">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center"
                    [ngClass]="{
                      'bg-green-100 dark:bg-green-900': transaction.type === 'income',
                      'bg-red-100 dark:bg-red-900': transaction.type === 'expense'
                    }"
                  >
                    <svg 
                      class="w-5 h-5"
                      [ngClass]="{
                        'text-green-600 dark:text-green-400': transaction.type === 'income',
                        'text-red-600 dark:text-red-400': transaction.type === 'expense'
                      }"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        stroke-width="2" 
                        [attr.d]="transaction.type === 'income' ? 'M12 6v6m0 0v6m0-6h6m-6 0H6' : 'M20 12H4'"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ transaction.category?.name || 'Sin categoría' }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ transaction.account?.name }} • {{ formatDate(transaction.date) }}
                    </p>
                  </div>
                </div>
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

            <ng-template #noTransactions>
              <div class="text-center py-6">
                <p class="text-gray-500 dark:text-gray-400 mb-3">No hay transacciones aún</p>
                <button routerLink="/add-transaction" class="text-blue-600 dark:text-blue-400 font-medium">
                  Agregar primera transacción
                </button>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p class="text-red-800 dark:text-red-200">{{ error }}</p>
          <button 
            (click)="loadDashboard()" 
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
export class DashboardComponent implements OnInit {
  userEmail = '';
  userProfile: Profile | null = null;
  dashboardData: DashboardData | null = null;
  isLoading = true;
  error = '';
  showProfileMenu = false;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly currencyService: CurrencyService,
    private readonly router: Router
  ) {
    this.supabaseService.currentUser.subscribe(user => {
      if (user) {
        this.userEmail = user.email || '';
        this.loadDashboard();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnInit() {
    // Close profile menu when clicking outside
    document.addEventListener('click', (event) => {
      if (!(event.target as Element).closest('.relative')) {
        this.showProfileMenu = false;
      }
    });
  }

  async loadDashboard() {
    try {
      this.isLoading = true;
      this.error = '';
      
      // Check if user is authenticated first
      const isLoggedIn = this.supabaseService.isLoggedIn;
      
      if (!isLoggedIn) {
        this.error = 'Usuario no autenticado';
        return;
      }
      
      // Load dashboard data and user profile
      const [dashboardData, profile] = await Promise.all([
        this.supabaseService.getDashboardData(),
        this.supabaseService.getProfile()
      ]);
      
      this.dashboardData = dashboardData;
      this.userProfile = profile;
      
      // Load user's preferred currency
      if (profile?.preferred_currency) {
        this.currencyService.loadUserCurrencyFromProfile(profile.preferred_currency);
      }
    } catch (error: any) {
      this.error = 'Error al cargar los datos: ' + (error?.message || 'Error desconocido');
      console.error('Error loading dashboard:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async signOut() {
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  getUserDisplayName(): string {
    if (this.userProfile?.full_name) {
      return this.userProfile.full_name;
    }
    if (this.userProfile?.username) {
      return this.userProfile.username;
    }
    return (this.userEmail || '').split('@')[0] || 'Usuario';
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatAmount(amount);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  goToProfile() {
    this.showProfileMenu = false; // Cerrar el menú
    this.router.navigate(['/profile']);
  }
}