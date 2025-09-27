export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  preferred_currency: string;
  language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string;
  type: TransactionType;
  amount: number;
  description?: string;
  notes?: string;
  date: string;
  created_at: string;
  updated_at: string;
  // Relaciones para joins
  account?: Account;
  category?: Category;
}

export type AccountType = 'bank' | 'cash' | 'credit_card' | 'debit_card' | 'savings';
export type TransactionType = 'income' | 'expense';

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  balance?: number;
  currency?: string;
  color?: string;
  icon?: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: TransactionType;
  color?: string;
  icon?: string;
}

export interface CreateTransactionRequest {
  account_id: string;
  category_id?: string;
  type: TransactionType;
  amount: number;
  description?: string;
  notes?: string;
  date: string;
}

export interface UpdateTransactionRequest {
  account_id?: string;
  category_id?: string;
  amount?: number;
  description?: string;
  notes?: string;
  date?: string;
}

// Interfaces para estadísticas y resúmenes
export interface AccountSummary {
  account: Account;
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  lastTransaction?: Transaction;
}

export interface CategorySummary {
  category: Category;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface PeriodSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
  categoryBreakdown: CategorySummary[];
}

export interface DashboardData {
  accounts: Account[];
  totalBalance: number;
  recentTransactions: Transaction[];
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNet: number;
  topCategories: CategorySummary[];
}

// Enums para iconos comunes
export const ACCOUNT_ICONS = {
  cash: 'banknotes',
  bank: 'building-library',
  credit_card: 'credit-card',
  debit_card: 'credit-card',
  savings: 'piggy-bank'
} as const;

export const CATEGORY_ICONS = {
  // Ingresos
  salary: 'banknotes',
  freelance: 'briefcase',
  investment: 'chart-bar',
  gift: 'gift',
  
  // Gastos
  food: 'shopping-cart',
  transport: 'truck',
  housing: 'home',
  entertainment: 'film',
  health: 'heart',
  education: 'academic-cap',
  clothing: 'shopping-bag',
  utilities: 'bolt',
  insurance: 'shield-check',
  other: 'dots-horizontal'
} as const;

export const ACCOUNT_COLORS = [
  '#2563EB', // Blue 600
  '#059669', // Emerald 600  
  '#DC2626', // Red 600
  '#7C3AED', // Violet 600
  '#EA580C', // Orange 600
  '#0891B2', // Cyan 600
  '#65A30D', // Lime 600
  '#C2410C', // Orange 700
  '#BE185D', // Pink 700
  '#4338CA', // Indigo 600
  '#0F766E', // Teal 700
  '#A21CAF'  // Fuchsia 700
];

export const CATEGORY_COLORS = [
  '#059669', // Emerald 600 (income default)
  '#10B981', // Emerald 500
  '#047857', // Emerald 700
  '#065F46', // Emerald 800
  '#DC2626', // Red 600 (expense default)
  '#EF4444', // Red 500
  '#B91C1C', // Red 700
  '#991B1B', // Red 800
  '#EA580C', // Orange 600
  '#D97706', // Amber 600
  '#7C3AED', // Violet 600
  '#0891B2'  // Cyan 600
];