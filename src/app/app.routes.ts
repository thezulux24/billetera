import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AddTransactionComponent } from './components/add-transaction/add-transaction.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { CreditSimulatorComponent } from './components/credit-simulator/credit-simulator.component';
import { AIAssistantComponent } from './components/ai-assistant/ai-assistant.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'add-transaction', component: AddTransactionComponent },
  { path: 'accounts', component: AccountsComponent },
  { path: 'accounts/create', component: CreateAccountComponent },
  { path: 'credit-simulator', component: CreditSimulatorComponent },
  { path: 'ai-assistant', component: AIAssistantComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'transactions', redirectTo: '/dashboard' },
  { path: '**', redirectTo: '/login' }
];
