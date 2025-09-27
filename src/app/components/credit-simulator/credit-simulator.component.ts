import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoanCalculation, AmortizationEntry } from '../../models/loan.models';

@Component({
  selector: 'app-credit-simulator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pb-20">
      <!-- Header -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-blue-100 dark:border-gray-700">
        <div class="px-4 py-6">
          <div class="flex items-center justify-between">
            <button (click)="goBack()" class="p-2 -ml-2 rounded-2xl hover:bg-blue-100 dark:hover:bg-gray-700 transition-all">
              <svg class="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Simulador de Créditos</h1>
              <p class="text-sm text-gray-600 dark:text-gray-400">Calcula tu préstamo ideal</p>
            </div>
            <div class="w-10"></div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="px-4 py-8 space-y-8">
        <!-- Loan Calculator Form -->
        <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div class="flex items-center mb-6">
            <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-3 mr-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Calculadora de Préstamos</h2>
              <p class="text-gray-600 dark:text-gray-400">Ingresa los datos de tu préstamo</p>
            </div>
          </div>

          <form [formGroup]="loanForm" class="space-y-6">
            <!-- Loan Amount -->
            <div class="space-y-3">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Monto del Préstamo
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-gray-500">$</span>
                <input
                  type="number"
                  formControlName="loanAmount"
                  (input)="calculateLoan()"
                  placeholder="50,000"
                  class="w-full pl-8 pr-4 py-4 border-2 border-blue-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-blue-50/50 dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold placeholder-gray-500 transition-all"
                />
              </div>
            </div>

            <!-- Interest Rate -->
            <div class="space-y-3">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tasa de Interés (%)
              </label>
              <div class="flex space-x-3">
                <div class="flex-1 relative">
                  <input
                    type="number"
                    step="0.01"
                    formControlName="interestRate"
                    (input)="calculateLoan()"
                    placeholder="12.5"
                    class="w-full px-4 py-4 border-2 border-blue-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-blue-50/50 dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold placeholder-gray-500 transition-all"
                  />
                  <span class="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-gray-500">%</span>
                </div>
                <select 
                  formControlName="interestRateType"
                  (change)="calculateLoan()"
                  class="px-4 py-4 border-2 border-blue-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-blue-50/50 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold transition-all"
                >
                  <option value="annual">Anual</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
            </div>

            <!-- Term -->
            <div class="space-y-3">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Plazo (años)
              </label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  *ngFor="let year of commonTerms"
                  (click)="selectTerm(year)"
                  [class]="getTermButtonClass(year)"
                >
                  {{ year }}
                </button>
              </div>
              <input
                type="number"
                formControlName="termYears"
                (input)="calculateLoan()"
                placeholder="Años personalizados"
                class="w-full px-4 py-4 border-2 border-blue-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-blue-50/50 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold placeholder-gray-500 transition-all"
              />
            </div>
          </form>
        </div>

        <!-- Results -->
        <div *ngIf="currentCalculation" class="space-y-6">
          <!-- Payment Summary -->
          <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl">
            <div class="text-center">
              <h3 class="text-lg font-semibold mb-2 text-green-100">Pago Mensual</h3>
              <div class="text-4xl font-bold mb-4">
                {{ formatCurrency(currentCalculation.monthlyPayment) }}
              </div>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="bg-white/20 rounded-2xl p-4">
                  <p class="text-green-100">Total Intereses</p>
                  <p class="text-xl font-bold">{{ formatCurrency(currentCalculation.totalInterest) }}</p>
                </div>
                <div class="bg-white/20 rounded-2xl p-4">
                  <p class="text-green-100">Total a Pagar</p>
                  <p class="text-xl font-bold">{{ formatCurrency(currentCalculation.totalPayment) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Breakdown Chart -->
          <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6">Desglose del Pago</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">Capital</span>
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(currentCalculation.loanAmount) }}
                </span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000"
                  [style.width.%]="getPrincipalPercentage()"
                ></div>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">Intereses</span>
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ formatCurrency(currentCalculation.totalInterest) }}
                </span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  class="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-1000"
                  [style.width.%]="getInterestPercentage()"
                ></div>
              </div>
            </div>
          </div>

          <!-- Amortization Table -->
          <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Tabla de Amortización</h3>
              <button 
                (click)="showFullTable = !showFullTable"
                class="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-medium"
              >
                {{ showFullTable ? 'Mostrar menos' : 'Ver todo' }}
              </button>
            </div>

            <div class="overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50 dark:bg-gray-700/50">
                      <th class="px-3 py-3 text-left font-semibold text-gray-900 dark:text-white rounded-l-xl">#</th>
                      <th class="px-3 py-3 text-right font-semibold text-gray-900 dark:text-white">Pago</th>
                      <th class="px-3 py-3 text-right font-semibold text-gray-900 dark:text-white">Capital</th>
                      <th class="px-3 py-3 text-right font-semibold text-gray-900 dark:text-white">Interés</th>
                      <th class="px-3 py-3 text-right font-semibold text-gray-900 dark:text-white rounded-r-xl">Saldo</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                    <tr 
                      *ngFor="let entry of getTableEntries(); trackBy: trackByMonth"
                      class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td class="px-3 py-3 font-medium text-gray-900 dark:text-white">{{ entry.month }}</td>
                      <td class="px-3 py-3 text-right font-semibold text-gray-900 dark:text-white">
                        {{ formatCurrency(entry.payment) }}
                      </td>
                      <td class="px-3 py-3 text-right text-blue-600 dark:text-blue-400 font-semibold">
                        {{ formatCurrency(entry.principal) }}
                      </td>
                      <td class="px-3 py-3 text-right text-red-600 dark:text-red-400 font-semibold">
                        {{ formatCurrency(entry.interest) }}
                      </td>
                      <td class="px-3 py-3 text-right font-semibold text-gray-900 dark:text-white">
                        {{ formatCurrency(entry.balance) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-4">
            <button 
              (click)="saveCalculation()"
              class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-105"
            >
              Guardar Simulación
            </button>
            <button 
              (click)="shareCalculation()"
              class="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-105"
            >
              Compartir
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CreditSimulatorComponent {
  loanForm: FormGroup;
  currentCalculation: LoanCalculation | null = null;
  showFullTable = false;
  commonTerms = [1, 2, 3, 5, 10, 15, 20, 30];

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {
    this.loanForm = this.fb.group({
      loanAmount: [100000, [Validators.required, Validators.min(1)]],
      interestRate: [12, [Validators.required, Validators.min(0.01)]],
      interestRateType: ['annual', [Validators.required]],
      termYears: [5, [Validators.required, Validators.min(1)]]
    });

    // Calculate initial loan
    this.calculateLoan();
  }

  calculateLoan() {
    if (this.loanForm.valid) {
      const values = this.loanForm.value;
      const principal = parseFloat(values.loanAmount);
      const interestRate = parseFloat(values.interestRate) / 100;
      const interestRateType = values.interestRateType;
      const years = parseFloat(values.termYears);
      
      if (principal > 0 && interestRate > 0 && years > 0) {
        // Convert to annual rate if needed
        const annualRate = interestRateType === 'monthly' ? interestRate * 12 : interestRate;
        this.currentCalculation = this.performLoanCalculation(principal, annualRate, years);
      }
    }
  }

  private performLoanCalculation(principal: number, annualRate: number, years: number): LoanCalculation {
    const monthlyRate = annualRate / 12;
    const totalMonths = years * 12;
    
    // Calculate monthly payment using the standard loan formula
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - principal;
    
    // Generate amortization schedule
    const schedule: AmortizationEntry[] = [];
    let remainingBalance = principal;
    
    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      let principalPayment = monthlyPayment - interestPayment;
      
      // For the last payment, adjust to ensure balance is exactly 0
      if (month === totalMonths) {
        principalPayment = remainingBalance; // Pay exactly the remaining balance
        const adjustedPayment = principalPayment + interestPayment;
        
        remainingBalance = 0;
        
        schedule.push({
          month,
          payment: adjustedPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: 0
        });
      } else {
        remainingBalance -= principalPayment;
        
        // Round to prevent floating point errors
        remainingBalance = Math.round(remainingBalance * 100) / 100;
        
        schedule.push({
          month,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: remainingBalance
        });
      }
    }
    
    return {
      loanAmount: principal,
      interestRate: annualRate * 100,
      termMonths: totalMonths,
      monthlyPayment,
      totalInterest,
      totalPayment,
      amortizationSchedule: schedule
    };
  }

  selectTerm(years: number) {
    this.loanForm.patchValue({ termYears: years });
    this.calculateLoan();
  }

  getTermButtonClass(years: number): string {
    const isSelected = this.loanForm.get('termYears')?.value === years;
    const baseClass = 'py-3 px-4 rounded-xl font-semibold transition-all';
    
    return `${baseClass} ${
      isSelected 
        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
        : 'bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-gray-600'
    }`;
  }

  getPrincipalPercentage(): number {
    if (!this.currentCalculation) return 0;
    return (this.currentCalculation.loanAmount / this.currentCalculation.totalPayment) * 100;
  }

  getInterestPercentage(): number {
    if (!this.currentCalculation) return 0;
    return (this.currentCalculation.totalInterest / this.currentCalculation.totalPayment) * 100;
  }

  getTableEntries(): AmortizationEntry[] {
    if (!this.currentCalculation) return [];
    
    const schedule = this.currentCalculation.amortizationSchedule;
    
    if (this.showFullTable) {
      return schedule;
    }
    
    // Show first 12 months for preview
    return schedule.slice(0, 12);
  }

  trackByMonth(index: number, entry: AmortizationEntry): number {
    return entry.month;
  }

  saveCalculation() {
    if (this.currentCalculation) {
      // TODO: Implement saving to Supabase
      console.log('Saving calculation:', this.currentCalculation);
      alert('Simulación guardada correctamente!');
    }
  }

  shareCalculation() {
    if (this.currentCalculation) {
      const shareData = {
        title: 'Simulación de Crédito',
        text: `Préstamo de ${this.formatCurrency(this.currentCalculation.loanAmount)} con pagos mensuales de ${this.formatCurrency(this.currentCalculation.monthlyPayment)}`,
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData);
      } else {
        // Fallback for browsers without native sharing
        navigator.clipboard.writeText(shareData.text + ' - ' + shareData.url);
        alert('Información copiada al portapapeles!');
      }
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}