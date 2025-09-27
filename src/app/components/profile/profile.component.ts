import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Profile, Currency } from '../../models/finance.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <!-- Header -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm">
        <div class="px-4 py-6">
          <div class="flex items-center justify-between">
            <button (click)="goBack()" class="p-2 -ml-2 rounded-2xl hover:bg-blue-100 dark:hover:bg-gray-700 transition-all">
              <svg class="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
            <button 
              (click)="logout()"
              class="p-2 rounded-2xl text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 space-y-6">
        <!-- Profile Card -->
        <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg">
          <!-- Avatar Section -->
          <div class="text-center mb-6">
            <div class="relative inline-block">
              <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-xl">
                {{ getInitials() }}
              </div>
              <button class="absolute bottom-1 right-1 w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Profile Form -->
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
            <!-- Full Name -->
            <div class="space-y-3 mb-4">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Nombre Completo
              </label>
              <input
                type="text"
                formControlName="full_name"
                placeholder="Tu nombre completo"
                class="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 transition-all"
              />
            </div>

            <!-- Username -->
            <div class="space-y-3 mb-4">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Nombre de Usuario
              </label>
              <input
                type="text"
                formControlName="username"
                placeholder="nombre_usuario"
                class="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 transition-all"
              />
            </div>

            <!-- Preferred Currency -->
            <div class="space-y-3 mb-4">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Moneda Preferida
              </label>
              <select 
                formControlName="preferred_currency"
                class="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              >
                <option 
                  *ngFor="let currency of availableCurrencies" 
                  [value]="currency.code"
                >
                  {{ currency.symbol }} {{ currency.name }} ({{ currency.code }})
                </option>
              </select>
            </div>

            <!-- Language -->
            <div class="space-y-3 mb-4">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Idioma
              </label>
              <select 
                formControlName="language"
                class="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              >
                <option value="es-ES">🇪🇸 Español</option>
                <option value="en-US">🇺🇸 English</option>
                <option value="pt-BR">🇧🇷 Português</option>
                <option value="fr-FR">🇫🇷 Français</option>
              </select>
            </div>

            <!-- Timezone -->
            <div class="space-y-3 mb-6">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Zona Horaria
              </label>
              <select 
                formControlName="timezone"
                class="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              >
                <option value="America/Mexico_City">México (GMT-6)</option>
                <option value="America/New_York">Nueva York (GMT-5)</option>
                <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                <option value="Europe/Madrid">Madrid (GMT+1)</option>
                <option value="Europe/Paris">París (GMT+1)</option>
              </select>
            </div>

            <!-- Save Button -->
            <button
              type="submit"
              [disabled]="profileForm.invalid || isLoading"
              class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:transform-none flex items-center justify-center"
            >
              <svg *ngIf="isLoading" class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}</span>
            </button>
          </form>
        </div>

        <!-- App Information -->
        <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Información de la App</h3>
          <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex justify-between">
              <span>Versión:</span>
              <span class="font-medium">1.0.0</span>
            </div>
            <div class="flex justify-between">
              <span>Última actualización:</span>
              <span class="font-medium">26 Sep 2025</span>
            </div>
            <div class="flex justify-between">
              <span>Cuentas registradas:</span>
              <span class="font-medium">{{ accountCount }}</span>
            </div>
            <div class="flex justify-between">
              <span>Transacciones:</span>
              <span class="font-medium">{{ transactionCount }}</span>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="bg-red-50 dark:bg-red-900/20 rounded-3xl p-6 border border-red-200 dark:border-red-800">
          <h3 class="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Zona de Peligro</h3>
          <p class="text-sm text-red-600 dark:text-red-400 mb-4">
            Estas acciones son permanentes y no se pueden deshacer.
          </p>
          <button class="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all">
            Eliminar Cuenta
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  currentProfile: Profile | null = null;
  accountCount = 0;
  transactionCount = 0;

  availableCurrencies: Currency[] = [
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', locale: 'en-US' },
    { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$', locale: 'es-MX' },
    { code: 'BRL', name: 'Real Brasileño', symbol: 'R$', locale: 'pt-BR' },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$', locale: 'es-AR' },
    { code: 'CLP', name: 'Peso Chileno', symbol: '$', locale: 'es-CL' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$', locale: 'es-CO' },
    { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', locale: 'es-PE' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly supabaseService: SupabaseService,
    private readonly router: Router
  ) {
    this.profileForm = this.fb.group({
      full_name: ['', Validators.required],
      username: ['', Validators.required],
      preferred_currency: ['USD', Validators.required],
      language: ['es-ES', Validators.required],
      timezone: ['America/Mexico_City', Validators.required]
    });
  }

  async ngOnInit() {
    await this.loadProfile();
    await this.loadStats();
  }

  private async loadProfile() {
    try {
      const user = this.supabaseService.currentUser;
      if (user) {
        const profile = await this.supabaseService.getProfile();
        if (profile) {
          this.currentProfile = profile;
          this.profileForm.patchValue({
            full_name: profile.full_name || '',
            username: profile.username || '',
            preferred_currency: profile.preferred_currency || 'USD',
            language: profile.language || 'es-ES',
            timezone: profile.timezone || 'America/Mexico_City'
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  private async loadStats() {
    try {
      const user = this.supabaseService.currentUser;
      if (user) {
        const accounts = await this.supabaseService.getAccounts();
        const transactions = await this.supabaseService.getTransactions();
        
        this.accountCount = accounts.length;
        this.transactionCount = transactions.length;
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  getInitials(): string {
    const fullName = this.profileForm.get('full_name')?.value || '';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase() || '??';
  }

  async saveProfile() {
    if (this.profileForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      try {
        const user = this.supabaseService.currentUser;
        if (user && this.currentProfile) {
          const updatedProfile: Partial<Profile> = {
            ...this.profileForm.value,
            updated_at: new Date().toISOString()
          };
          
          await this.supabaseService.updateProfile(updatedProfile);
          
          // Show success message or navigate back
          alert('¡Perfil actualizado correctamente!');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error al actualizar el perfil. Inténtalo de nuevo.');
      } finally {
        this.isLoading = false;
      }
    }
  }

  async logout() {
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}