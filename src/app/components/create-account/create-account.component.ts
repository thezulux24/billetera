import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AccountType, ACCOUNT_COLORS } from '../../models/finance.models';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div class="px-4 py-4">
          <div class="flex items-center justify-between">
            <button (click)="goBack()" class="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg class="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ isEditing ? 'Editar Cuenta' : 'Nueva Cuenta' }}
            </h1>
            <div class="w-10"></div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-4 py-8">
        <form [formGroup]="accountForm" (ngSubmit)="onSubmit()" class="space-y-8">
          <!-- Error Message -->
          <div *ngIf="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-red-800 dark:text-red-300 text-sm font-medium">{{ errorMessage }}</p>
            </div>
          </div>

          <!-- Account Type Selection -->
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <label class="block text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Tipo de Cuenta
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                *ngFor="let type of accountTypes"
                (click)="selectAccountType(type.value)"
                [class]="getAccountTypeButtonClass(type.value)"
              >
                <div class="flex flex-col items-center space-y-3 p-4">
                  <div 
                    class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all"
                    [ngClass]="{
                      'bg-blue-500 shadow-lg shadow-blue-500/25': selectedAccountType === type.value,
                      'bg-gray-100 dark:bg-gray-700': selectedAccountType !== type.value
                    }"
                  >
                    <svg 
                      class="w-8 h-8 transition-colors"
                      [ngClass]="{
                        'text-white': selectedAccountType === type.value,
                        'text-gray-600 dark:text-gray-400': selectedAccountType !== type.value
                      }"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="type.icon"/>
                    </svg>
                  </div>
                  <div class="text-center">
                    <p 
                      class="font-semibold transition-colors"
                      [ngClass]="{
                        'text-blue-600 dark:text-blue-400': selectedAccountType === type.value,
                        'text-gray-900 dark:text-white': selectedAccountType !== type.value
                      }"
                    >
                      {{ type.label }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ type.description }}</p>
                  </div>
                </div>
              </button>
            </div>
            <div *ngIf="accountForm.get('type')?.invalid && accountForm.get('type')?.touched" class="mt-3 text-red-500 text-sm font-medium">
              Selecciona un tipo de cuenta
            </div>
          </div>

          <!-- Account Name -->
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <label class="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nombre de la Cuenta
            </label>
            <input
              type="text"
              formControlName="name"
              placeholder="Ej: Cuenta Corriente Banco Nacional"
              class="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-lg placeholder-gray-500 dark:placeholder-gray-400 transition-all"
            />
            <div *ngIf="accountForm.get('name')?.invalid && accountForm.get('name')?.touched" class="mt-3 text-red-500 text-sm font-medium">
              El nombre es requerido
            </div>
          </div>

          <!-- Initial Balance -->
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <label class="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Balance Inicial
            </label>
            <div class="relative">
              <span class="absolute left-6 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                formControlName="balance"
                placeholder="0.00"
                class="w-full pl-12 pr-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-2xl font-bold placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              />
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Puedes dejarlo en 0 si no quieres agregar un balance inicial
            </p>
          </div>

          <!-- Color Selection -->
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <label class="block text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Color de la Cuenta
            </label>
            <div class="grid grid-cols-5 gap-4">
              <button
                type="button"
                *ngFor="let color of accountColors"
                (click)="selectColor(color)"
                class="w-12 h-12 rounded-2xl border-4 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                [style.backgroundColor]="color"
                [class]="selectedColor === color ? 'border-gray-800 dark:border-white shadow-lg' : 'border-gray-200 dark:border-gray-600'"
              >
                <svg 
                  *ngIf="selectedColor === color" 
                  class="w-6 h-6 text-white mx-auto" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-4">
            <button
              type="submit"
              [disabled]="accountForm.invalid || isLoading"
              class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-5 px-8 rounded-2xl text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-600/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <div class="flex items-center justify-center">
                <svg 
                  *ngIf="isLoading" 
                  class="animate-spin w-6 h-6 mr-3" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isLoading ? 'Guardando...' : (isEditing ? 'Actualizar Cuenta' : 'Crear Cuenta') }}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CreateAccountComponent implements OnInit {
  accountForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  isEditing = false;
  selectedAccountType: AccountType | null = null;
  selectedColor = ACCOUNT_COLORS[0];
  accountColors = ACCOUNT_COLORS;

  accountTypes = [
    {
      value: 'cash' as AccountType,
      label: 'Efectivo',
      description: 'Dinero en efectivo',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
    },
    {
      value: 'bank' as AccountType,
      label: 'Banco',
      description: 'Cuenta corriente o de ahorros',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    },
    {
      value: 'credit_card' as AccountType,
      label: 'Tarjeta Crédito',
      description: 'Línea de crédito',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
    },
    {
      value: 'debit_card' as AccountType,
      label: 'Tarjeta Débito',
      description: 'Tarjeta de débito bancaria',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
    },
    {
      value: 'savings' as AccountType,
      label: 'Ahorros',
      description: 'Cuenta de ahorros o inversión',
      icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
    }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly supabaseService: SupabaseService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.accountForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', Validators.required],
      balance: [0, [Validators.min(0)]],
      color: [this.selectedColor]
    });
  }

  ngOnInit() {
    // Check if editing existing account
    const accountId = this.route.snapshot.params['id'];
    if (accountId) {
      this.isEditing = true;
      // Load account data for editing (implement if needed)
    }

    // Set default account type to bank
    this.selectAccountType('bank');
  }

  selectAccountType(type: AccountType) {
    this.selectedAccountType = type;
    this.accountForm.patchValue({ type });
  }

  selectColor(color: string) {
    this.selectedColor = color;
    this.accountForm.patchValue({ color });
  }

  getAccountTypeButtonClass(type: AccountType): string {
    const baseClass = 'w-full rounded-3xl border-2 transition-all hover:shadow-md';
    const isSelected = this.selectedAccountType === type;
    
    return `${baseClass} ${
      isSelected 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10'
        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
    }`;
  }

  async onSubmit() {
    if (this.accountForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const formValue = this.accountForm.value;
        
        await this.supabaseService.createAccount({
          name: formValue.name,
          type: formValue.type,
          balance: parseFloat(formValue.balance) || 0,
          color: formValue.color,
          currency: 'USD'
        });

        // Navigate back to accounts
        this.router.navigate(['/accounts']);

      } catch (error: any) {
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
      }
    }
  }

  goBack() {
    this.router.navigate(['/accounts']);
  }
}