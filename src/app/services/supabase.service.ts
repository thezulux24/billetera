import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  Account, 
  Category, 
  Transaction, 
  CreateAccountRequest,
  CreateCategoryRequest,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  DashboardData,
  PeriodSummary,
  Profile
} from '../models/finance.models';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _currentUser = new BehaviorSubject<User | null>(null);
  private _session = new BehaviorSubject<Session | null>(null);

  constructor() {
    this.supabase = createClient(
      'https://ewcksgepmqrrmqguoyaq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3Y2tzZ2VwbXFycm1xZ3VveWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MzMzOTcsImV4cCI6MjA3NDUwOTM5N30.vJOVw_V0kyHr5oK8zvJS9Yw_nVZpod6YYUKvb2y-pGs'
    );

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this._session.next(session);
      this._currentUser.next(session?.user ?? null);
    });

    // Initialize with current session
    this.loadUser();
  }

  private async loadUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    this._currentUser.next(user);
    
    const { data: { session } } = await this.supabase.auth.getSession();
    this._session.next(session);
  }

  get currentUser(): Observable<User | null> {
    return this._currentUser.asObservable();
  }

  get session(): Observable<Session | null> {
    return this._session.asObservable();
  }

  get isLoggedIn(): boolean {
    return this._currentUser.value !== null;
  }

  // ========== AUTH METHODS ==========
  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      throw new Error(error.message);
    }
  }

  // ========== PROFILE METHODS ==========
  async getProfile(): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(profile)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // ========== ACCOUNT METHODS ==========
  async getAccounts(): Promise<Account[]> {
    const { data, error } = await this.supabase
      .from('accounts')
      .select('*')
      .eq('is_active', true)
      .order('created_at');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async createAccount(account: CreateAccountRequest): Promise<Account> {
    const { data, error } = await this.supabase
      .from('accounts')
      .insert([{
        ...account,
        user_id: this._currentUser.value?.id
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
    const { data, error } = await this.supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteAccount(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // ========== CATEGORY METHODS ==========
  async getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
    let query = this.supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async createCategory(category: CreateCategoryRequest): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert([{
        ...category,
        user_id: this._currentUser.value?.id
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // ========== TRANSACTION METHODS ==========
  async getTransactions(limit?: number, offset?: number): Promise<Transaction[]> {
    let query = this.supabase
      .from('transactions')
      .select(`
        *,
        account:accounts(*),
        category:categories(*)
      `)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select(`
        *,
        account:accounts(*),
        category:categories(*)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async createTransaction(transaction: CreateTransactionRequest): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from('transactions')
      .insert([{
        ...transaction,
        user_id: this._currentUser.value?.id
      }])
      .select(`
        *,
        account:accounts(*),
        category:categories(*)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateTransaction(id: string, updates: UpdateTransactionRequest): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        account:accounts(*),
        category:categories(*)
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // ========== DASHBOARD & ANALYTICS METHODS ==========
  async getDashboardData(): Promise<DashboardData> {
    // Get current month start and end
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Fetch all data in parallel
    const [accounts, recentTransactions, monthlyTransactions] = await Promise.all([
      this.getAccounts(),
      this.getTransactions(10), // Recent 10 transactions
      this.getTransactionsByDateRange(monthStart, monthEnd)
    ]);

    // Calculate monthly totals
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    // Get top categories for this month
    const categoryTotals = monthlyTransactions
      .filter(t => t.category)
      .reduce((acc, t) => {
        const categoryId = t.category!.id;
        if (!acc[categoryId]) {
          acc[categoryId] = {
            category: t.category!,
            totalAmount: 0,
            transactionCount: 0,
            percentage: 0
          };
        }
        acc[categoryId].totalAmount += t.amount;
        acc[categoryId].transactionCount += 1;
        return acc;
      }, {} as Record<string, any>);

    const topCategories = Object.values(categoryTotals)
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    // Calculate percentages
    const totalCategoryAmount = topCategories.reduce((sum: number, cat: any) => sum + cat.totalAmount, 0);
    topCategories.forEach((cat: any) => {
      cat.percentage = totalCategoryAmount > 0 ? (cat.totalAmount / totalCategoryAmount) * 100 : 0;
    });

    return {
      accounts,
      totalBalance,
      recentTransactions,
      monthlyIncome,
      monthlyExpenses,
      monthlyNet: monthlyIncome - monthlyExpenses,
      topCategories
    };
  }

  async getPeriodSummary(startDate: string, endDate: string): Promise<PeriodSummary> {
    const transactions = await this.getTransactionsByDateRange(startDate, endDate);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryTotals = transactions
      .filter(t => t.category)
      .reduce((acc, t) => {
        const categoryId = t.category!.id;
        if (!acc[categoryId]) {
          acc[categoryId] = {
            category: t.category!,
            totalAmount: 0,
            transactionCount: 0,
            percentage: 0
          };
        }
        acc[categoryId].totalAmount += t.amount;
        acc[categoryId].transactionCount += 1;
        return acc;
      }, {} as Record<string, any>);

    const categoryBreakdown = Object.values(categoryTotals);
    const totalCategoryAmount = categoryBreakdown.reduce((sum: number, cat: any) => sum + cat.totalAmount, 0);
    
    categoryBreakdown.forEach((cat: any) => {
      cat.percentage = totalCategoryAmount > 0 ? (cat.totalAmount / totalCategoryAmount) * 100 : 0;
    });

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      categoryBreakdown: categoryBreakdown.sort((a: any, b: any) => b.totalAmount - a.totalAmount)
    };
  }
}