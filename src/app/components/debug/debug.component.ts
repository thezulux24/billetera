import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">🔍 Diagnóstico de Sistema</h1>
      
      <div class="space-y-4">
        <div class="p-4 border rounded">
          <h2 class="font-semibold">Estado de Autenticación</h2>
          <p>Usuario autenticado: <span [class]="authStatus.isLoggedIn ? 'text-green-600' : 'text-red-600'">{{ authStatus.isLoggedIn ? 'SÍ' : 'NO' }}</span></p>
          <p *ngIf="authStatus.userId">ID de usuario: {{ authStatus.userId }}</p>
          <p *ngIf="authStatus.email">Email: {{ authStatus.email }}</p>
        </div>

        <div class="p-4 border rounded">
          <h2 class="font-semibold">Conexión a Base de Datos</h2>
          <p>Estado: <span [class]="dbTest.status === 'success' ? 'text-green-600' : dbTest.status === 'error' ? 'text-red-600' : 'text-yellow-600'">{{ dbTest.message }}</span></p>
          <div *ngIf="dbTest.error" class="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
            {{ dbTest.error }}
          </div>
        </div>

        <div class="p-4 border rounded">
          <h2 class="font-semibold">Datos de Dashboard</h2>
          <p>Estado: <span [class]="dashboardTest.status === 'success' ? 'text-green-600' : dashboardTest.status === 'error' ? 'text-red-600' : 'text-yellow-600'">{{ dashboardTest.message }}</span></p>
          <div *ngIf="dashboardTest.data" class="mt-2 p-2 bg-gray-100 rounded text-sm">
            <p>Cuentas: {{ dashboardTest.data.accounts?.length || 0 }}</p>
            <p>Transacciones recientes: {{ dashboardTest.data.recentTransactions?.length || 0 }}</p>
            <p>Balance total: {{ dashboardTest.data.totalBalance || 0 }}</p>
          </div>
          <div *ngIf="dashboardTest.error" class="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
            {{ dashboardTest.error }}
          </div>
        </div>

        <div class="p-4 border rounded">
          <h2 class="font-semibold">Perfil de Usuario</h2>
          <p>Estado: <span [class]="profileTest.status === 'success' ? 'text-green-600' : profileTest.status === 'error' ? 'text-red-600' : 'text-yellow-600'">{{ profileTest.message }}</span></p>
          <div *ngIf="profileTest.data" class="mt-2 p-2 bg-gray-100 rounded text-sm">
            <p>Nombre: {{ profileTest.data.full_name || 'No establecido' }}</p>
            <p>Username: {{ profileTest.data.username || 'No establecido' }}</p>
            <p>Moneda: {{ profileTest.data.preferred_currency || 'No establecido' }}</p>
          </div>
          <div *ngIf="profileTest.error" class="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
            {{ profileTest.error }}
          </div>
        </div>

        <button 
          (click)="runTests()" 
          class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          [disabled]="isRunning"
        >
          {{ isRunning ? 'Ejecutando pruebas...' : '🔄 Ejecutar Pruebas Nuevamente' }}
        </button>
      </div>
    </div>
  `
})
export class DebugComponent implements OnInit {
  authStatus = {
    isLoggedIn: false,
    userId: null as string | null,
    email: null as string | null
  };

  dbTest = {
    status: 'pending' as 'pending' | 'success' | 'error',
    message: 'Pendiente...',
    error: null as string | null
  };

  dashboardTest = {
    status: 'pending' as 'pending' | 'success' | 'error',
    message: 'Pendiente...',
    data: null as any,
    error: null as string | null
  };

  profileTest = {
    status: 'pending' as 'pending' | 'success' | 'error',
    message: 'Pendiente...',
    data: null as any,
    error: null as string | null
  };

  isRunning = false;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.runTests();
  }

  async runTests() {
    this.isRunning = true;

    // Test authentication
    try {
      const isLoggedIn = this.supabaseService.isLoggedIn;
      this.authStatus.isLoggedIn = isLoggedIn;
      
      if (isLoggedIn) {
        // Get user info from observable
        this.supabaseService.currentUser.subscribe(user => {
          if (user) {
            this.authStatus.userId = user.id;
            this.authStatus.email = user.email || null;
          }
        });
      }
    } catch (error) {
      console.error('Auth test error:', error);
    }

    // Test database connection
    try {
      this.dbTest.status = 'pending';
      this.dbTest.message = 'Probando conexión...';
      
      const accounts = await this.supabaseService.getAccounts();
      this.dbTest.status = 'success';
      this.dbTest.message = `Conectado - ${accounts.length} cuentas encontradas`;
      this.dbTest.error = null;
    } catch (error: any) {
      this.dbTest.status = 'error';
      this.dbTest.message = 'Error de conexión';
      this.dbTest.error = error.message || error.toString();
    }

    // Test dashboard data
    try {
      this.dashboardTest.status = 'pending';
      this.dashboardTest.message = 'Cargando datos del dashboard...';
      
      const dashboardData = await this.supabaseService.getDashboardData();
      this.dashboardTest.status = 'success';
      this.dashboardTest.message = 'Datos cargados correctamente';
      this.dashboardTest.data = dashboardData;
      this.dashboardTest.error = null;
    } catch (error: any) {
      this.dashboardTest.status = 'error';
      this.dashboardTest.message = 'Error cargando dashboard';
      this.dashboardTest.error = error.message || error.toString();
    }

    // Test profile
    try {
      this.profileTest.status = 'pending';
      this.profileTest.message = 'Cargando perfil...';
      
      const profile = await this.supabaseService.getProfile();
      this.profileTest.status = 'success';
      this.profileTest.message = profile ? 'Perfil cargado' : 'Sin perfil';
      this.profileTest.data = profile;
      this.profileTest.error = null;
    } catch (error: any) {
      this.profileTest.status = 'error';
      this.profileTest.message = 'Error cargando perfil';
      this.profileTest.error = error.message || error.toString();
    }

    this.isRunning = false;
  }
}