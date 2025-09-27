import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-sm w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Crea tu cuenta
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            O
            <a routerLink="/login" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              inicia sesión con tu cuenta existente
            </a>
          </p>
        </div>
        
        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <!-- Error Message -->
          <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p class="text-sm text-red-800 dark:text-red-400">{{ errorMessage }}</p>
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <p class="text-sm text-green-800 dark:text-green-400">{{ successMessage }}</p>
          </div>

          <div class="mb-5">
            <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Tu correo electrónico
            </label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
              placeholder="correo@ejemplo.com" 
              required 
            />
            <div *ngIf="signupForm.get('email')?.invalid && signupForm.get('email')?.touched" class="mt-1 text-sm text-red-600 dark:text-red-400">
              <span *ngIf="signupForm.get('email')?.hasError('required')">El correo electrónico es obligatorio</span>
              <span *ngIf="signupForm.get('email')?.hasError('email')">Por favor ingresa un correo válido</span>
            </div>
          </div>

          <div class="mb-5">
            <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Tu contraseña
            </label>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
              required 
            />
            <div *ngIf="signupForm.get('password')?.invalid && signupForm.get('password')?.touched" class="mt-1 text-sm text-red-600 dark:text-red-400">
              <span *ngIf="signupForm.get('password')?.hasError('required')">La contraseña es obligatoria</span>
              <span *ngIf="signupForm.get('password')?.hasError('minlength')">La contraseña debe tener al menos 6 caracteres</span>
            </div>
          </div>

          <div class="mb-5">
            <label for="confirmPassword" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Confirmar contraseña
            </label>
            <input 
              type="password" 
              id="confirmPassword" 
              formControlName="confirmPassword"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
              required 
            />
            <div *ngIf="signupForm.get('confirmPassword')?.invalid && signupForm.get('confirmPassword')?.touched" class="mt-1 text-sm text-red-600 dark:text-red-400">
              <span *ngIf="signupForm.get('confirmPassword')?.hasError('required')">La confirmación de contraseña es obligatoria</span>
            </div>
            <div *ngIf="signupForm.hasError('passwordMismatch') && signupForm.get('confirmPassword')?.touched" class="mt-1 text-sm text-red-600 dark:text-red-400">
              Las contraseñas no coinciden
            </div>
          </div>

          <div class="flex items-start mb-5">
            <div class="flex items-center h-5">
              <input 
                id="terms" 
                type="checkbox" 
                formControlName="acceptTerms"
                class="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" 
                required 
              />
            </div>
            <label for="terms" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Acepto los 
              <a href="#" class="text-blue-600 hover:text-blue-500 dark:text-blue-400">Términos y Condiciones</a>
            </label>
          </div>
          <div *ngIf="signupForm.get('acceptTerms')?.invalid && signupForm.get('acceptTerms')?.touched" class="mt-1 text-sm text-red-600 dark:text-red-400">
            Debes aceptar los términos y condiciones
          </div>

          <div>
            <button 
              type="submit" 
              [disabled]="signupForm.invalid || isLoading"
              class="group relative w-full flex justify-center py-2.5 px-5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <span *ngIf="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoading ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  async onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const { email, password } = this.signupForm.value;
        const result = await this.supabaseService.signUp(email, password);
        
        if (result.user && !result.user.email_confirmed_at) {
          this.successMessage = '¡Cuenta creada! Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.';
        } else if (result.user) {
          this.successMessage = '¡Cuenta creada exitosamente! Redirigiendo al login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      } catch (error: any) {
        this.errorMessage = error.message;
      } finally {
        this.isLoading = false;
      }
    }
  }
}