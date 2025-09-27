import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 pb-4 pt-2">
      <div class="flex justify-around">
        <!-- Home -->
        <button
          routerLink="/dashboard"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{exact: true}"
          class="nav-item"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span class="nav-label">Inicio</span>
        </button>

        <!-- AI Assistant -->
        <button
          routerLink="/ai-assistant"
          routerLinkActive="active"
          class="nav-item"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          <span class="nav-label">Asistente IA</span>
        </button>

        <!-- Add Transaction -->
        <button
          routerLink="/add-transaction"
          class="add-button"
        >
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </button>

        <!-- Accounts -->
        <button
          routerLink="/accounts"
          routerLinkActive="active"
          class="nav-item"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
          <span class="nav-label">Cuentas</span>
        </button>

        <!-- Profile -->
        <button
          routerLink="/profile"
          routerLinkActive="active"
          class="nav-item"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span class="nav-label">Perfil</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      color: #6b7280;
      transition: colors 0.2s;
    }

    .nav-item.active {
      color: #2563eb;
    }

    .nav-item:hover {
      color: #3b82f6;
      background-color: #eff6ff;
    }

    .nav-label {
      font-size: 0.75rem;
      font-weight: 500;
    }

    .add-button {
      background: linear-gradient(to right, #3b82f6, #2563eb);
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
      margin-top: -8px;
    }

    .add-button:hover {
      background: linear-gradient(to right, #2563eb, #1d4ed8);
    }

    .add-button:active {
      transform: scale(0.95);
    }
  `]
})
export class BottomNavComponent {
  constructor(private readonly router: Router) {}
}