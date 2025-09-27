import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Account, Category, TransactionType } from '../../models/finance.models';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 shadow-sm">
        <div class="px-4 py-4">
          <div class="flex items-center justify-between">
            <button (click)="goBack()" class="p-2 -ml-2 rounded-lg">
              <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ transactionType === 'income' ? 'Nuevo Ingreso' : 'Nuevo Gasto' }}
            </h1>
            <div class="w-10"></div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-4 py-6">
        <!-- Transaction Type Toggle -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-1 mb-6 shadow-sm">
          <div class="grid grid-cols-2" style="gap: 0.25rem;">
            <button
              type="button"
              (click)="setTransactionType('income')"
              [class]="getTypeButtonClass('income')"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Ingreso
            </button>
            <button
              type="button"
              (click)="setTransactionType('expense')"
              [class]="getTypeButtonClass('expense')"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
              </svg>
              Gasto
            </button>
          </div>
        </div>

        <!-- Form -->
        <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Error Message -->
          <div *ngIf="errorMessage" class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p class="text-red-800 dark:text-red-200 text-sm">{{ errorMessage }}</p>
          </div>

          <!-- Amount Input -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cantidad
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-semibold text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                formControlName="amount"
                class="w-full text-4xl font-bold text-center bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white pl-8"
                placeholder="0.00"
                min="0"
              />
            </div>
            <div *ngIf="transactionForm.get('amount')?.invalid && transactionForm.get('amount')?.touched" class="mt-2 text-red-500 text-sm">
              La cantidad es requerida y debe ser mayor a 0
            </div>
          </div>

          <!-- Account Selection -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Cuenta
            </label>
            <div class="space-y-2" *ngIf="accounts.length > 0; else noAccountsTemplate">
              <button
                type="button"
                *ngFor="let account of accounts"
                (click)="selectAccount(account)"
                [class]="getAccountButtonClass(account)"
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
                  <div class="flex-1 text-left">
                    <p class="font-medium text-gray-900 dark:text-white">{{ account.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ formatCurrency(account.balance) }}
                    </p>
                  </div>
                </div>
                <svg 
                  class="w-5 h-5 text-blue-500" 
                  [class.opacity-0]="selectedAccount?.id !== account.id"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
            </div>

            <ng-template #noAccountsTemplate>
              <div class="text-center py-4">
                <p class="text-gray-500 dark:text-gray-400 text-sm mb-2">No tienes cuentas</p>
                <button type="button" class="text-blue-600 dark:text-blue-400 text-sm font-medium">
                  Crear primera cuenta
                </button>
              </div>
            </ng-template>

            <div *ngIf="transactionForm.get('account_id')?.invalid && transactionForm.get('account_id')?.touched" class="mt-2 text-red-500 text-sm">
              Debes seleccionar una cuenta
            </div>
          </div>

          <!-- Category Selection -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Categoría *
            </label>
            <div *ngIf="selectedCategory" class="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div class="flex items-center space-x-2">
                <div 
                  class="w-8 h-8 rounded-lg flex items-center justify-center"
                  [style.backgroundColor]="selectedCategory.color"
                >
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-blue-700 dark:text-blue-300">{{ selectedCategory.name }}</span>
                <button 
                  type="button" 
                  (click)="clearCategory()"
                  class="ml-auto text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3" *ngIf="filteredCategories.length > 0; else noCategoriesTemplate">
              <button
                type="button"
                *ngFor="let category of filteredCategories"
                (click)="selectCategory(category)"
                class="p-3 rounded-xl border-2 transition-all hover:scale-105"
                [class]="selectedCategory?.id === category.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'">
                <div class="flex flex-col items-center space-y-2">
                  <div 
                    class="w-12 h-12 rounded-xl flex items-center justify-center"
                    [style.backgroundColor]="category.color">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getCategoryIcon(category.name)"/>
                    </svg>
                  </div>
                  <span class="text-xs font-medium text-gray-900 dark:text-white text-center leading-tight">
                    {{ category.name }}
                  </span>
                </div>
              </button>
            </div>

            <ng-template #noCategoriesTemplate>
              <div class="text-center py-6">
                <div class="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                </div>
                <p class="text-gray-500 dark:text-gray-400 text-sm mb-3">Cargando categorías...</p>
                <div class="animate-pulse h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
            </ng-template>
          </div>

          <!-- Description -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Descripción (opcional)
            </label>
            <input
              type="text"
              formControlName="description"
              placeholder="¿En qué gastaste?"
              class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <!-- Date -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Fecha
            </label>
            <input
              type="date"
              formControlName="date"
              class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div *ngIf="transactionForm.get('date')?.invalid && transactionForm.get('date')?.touched" class="mt-2 text-red-500 text-sm">
              La fecha es requerida
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-4">
            <button
              type="submit"
              [disabled]="transactionForm.invalid || isLoading || !selectedCategory || !selectedAccount"
              [class]="getSubmitButtonClass()"
            >
              <svg *ngIf="isLoading" class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span *ngIf="!isLoading">
                {{ transactionType === 'income' ? 'Agregar Ingreso' : 'Agregar Gasto' }}
                <span *ngIf="!selectedCategory || !selectedAccount" class="text-sm opacity-75 block">
                  {{ !selectedAccount ? 'Selecciona una cuenta' : !selectedCategory ? 'Selecciona una categoría' : '' }}
                </span>
              </span>
              <span *ngIf="isLoading">Guardando...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AddTransactionComponent implements OnInit {
  transactionForm: FormGroup;
  transactionType: TransactionType = 'expense';
  accounts: Account[] = [];
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  selectedAccount: Account | null = null;
  selectedCategory: Category | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly supabaseService: SupabaseService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.transactionForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      account_id: ['', Validators.required],
      category_id: [''],
      description: [''],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit(): void {
    // Get transaction type from query params
    this.route.queryParams.subscribe(params => {
      if (params['type'] && ['income', 'expense'].includes(params['type'])) {
        this.transactionType = params['type'];
        this.filterCategories();
      }
    });

    this.loadData();
  }

  async loadData() {
    try {
      this.isLoading = true;
      const [accounts, categories] = await Promise.all([
        this.supabaseService.getAccounts(),
        this.supabaseService.getCategories()
      ]);

      this.accounts = accounts;
      this.categories = categories;
      this.filterCategories();

      // Auto-select first account if only one exists
      if (this.accounts.length === 1) {
        this.selectAccount(this.accounts[0]);
      }

    } catch (error: any) {
      this.errorMessage = 'Error al cargar datos: ' + error.message;
    } finally {
      this.isLoading = false;
    }
  }

  setTransactionType(type: TransactionType) {
    this.transactionType = type;
    this.selectedCategory = null;
    this.transactionForm.patchValue({ category_id: '' });
    this.filterCategories();
  }

  filterCategories() {
    this.filteredCategories = this.categories.filter(cat => cat.type === this.transactionType);
  }

  selectAccount(account: Account) {
    this.selectedAccount = account;
    this.transactionForm.patchValue({ account_id: account.id });
  }

  selectCategory(category: Category) {
    this.selectedCategory = category;
    this.transactionForm.patchValue({ category_id: category.id });
  }

  clearCategory() {
    this.selectedCategory = null;
    this.transactionForm.patchValue({ category_id: null });
  }

  getCategoryIcon(categoryName: string): string {
    const iconMap: Record<string, string> = {
      'Salario': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
      'Freelance': 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8',
      'Inversiones': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'Regalos': 'M12 3v1m0 0l4 4H8l4-4zm6 6l2-2m-2 2l-4-4m6 6h2m-2 0l-2-2m4 4h-6l4-4zm-8 6v1m0-1l-4-4h8l-4 4zm-6-6l-2 2m2-2l4 4m-6-6H2m2 0l2 2m-4-4h6L4 8z',
      'Alimentación': 'M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
      'Transporte': 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM7 17h10m-10 0V7a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1V7a1 1 0 011-1h2a1 1 0 011 1v10',
      'Vivienda': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'Salud': 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      'Educación': 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'
    };
    return iconMap[categoryName] || 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z';
  }

  getTypeButtonClass(type: TransactionType): string {
    const baseClass = 'flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-colors';
    const activeClass = type === 'income' 
      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
      : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
    const inactiveClass = 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700';
    
    return `${baseClass} ${this.transactionType === type ? activeClass : inactiveClass}`;
  }

  getAccountButtonClass(account: Account): string {
    const baseClass = 'w-full flex items-center justify-between p-3 rounded-lg border transition-colors';
    const selected = this.selectedAccount?.id === account.id;
    
    return `${baseClass} ${
      selected 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
    }`;
  }

  getCategoryButtonClass(category: Category): string {
    const baseClass = 'p-3 rounded-xl transition-colors';
    const selected = this.selectedCategory?.id === category.id;
    
    return `${baseClass} ${
      selected 
        ? 'bg-opacity-20'
        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
    }`;
  }

  getSubmitButtonClass(): string {
    const baseClass = 'w-full flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white transition-colors';
    const typeClass = this.transactionType === 'income' 
      ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
      : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400';
    
    return `${baseClass} ${typeClass} disabled:cursor-not-allowed`;
  }

  async onSubmit() {
    if (!this.selectedAccount) {
      this.errorMessage = 'Por favor selecciona una cuenta';
      return;
    }

    if (!this.selectedCategory) {
      this.errorMessage = 'Por favor selecciona una categoría';
      return;
    }

    if (this.transactionForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const formValue = this.transactionForm.value;
        
        await this.supabaseService.createTransaction({
          account_id: formValue.account_id,
          category_id: this.selectedCategory.id,
          type: this.transactionType,
          amount: parseFloat(formValue.amount),
          description: formValue.description || undefined,
          date: formValue.date
        });

        // Navigate back to dashboard
        this.router.navigate(['/dashboard']);

      } catch (error: any) {
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'Por favor completa todos los campos requeridos';
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }
}