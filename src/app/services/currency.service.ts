import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Currency } from '../models/finance.models';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private availableCurrencies: Currency[] = [
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', locale: 'en-US' },
    { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$', locale: 'es-MX' },
    { code: 'BRL', name: 'Real Brasileño', symbol: 'R$', locale: 'pt-BR' },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$', locale: 'es-AR' },
    { code: 'CLP', name: 'Peso Chileno', symbol: '$', locale: 'es-CL' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$', locale: 'es-CO' },
    { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', locale: 'es-PE' }
  ];

  private currentCurrencySubject = new BehaviorSubject<Currency>(this.availableCurrencies.find(c => c.code === 'COP') || this.availableCurrencies[0]);
  public currentCurrency$ = this.currentCurrencySubject.asObservable();

  constructor() {
    // No dependencies in constructor to avoid circular dependency
  }

  // Method to load user currency from outside to avoid circular dependency
  loadUserCurrencyFromProfile(preferredCurrency?: string) {
    if (preferredCurrency) {
      const currency = this.getCurrencyByCode(preferredCurrency);
      if (currency) {
        this.currentCurrencySubject.next(currency);
      }
    }
  }

  getCurrentCurrency(): Currency {
    return this.currentCurrencySubject.value;
  }

  getCurrencyByCode(code: string): Currency | undefined {
    return this.availableCurrencies.find(currency => currency.code === code);
  }

  getAvailableCurrencies(): Currency[] {
    return [...this.availableCurrencies];
  }

  setCurrency(currency: Currency) {
    this.currentCurrencySubject.next(currency);
  }

  formatAmount(amount: number, showSymbol: boolean = true): string {
    const currency = this.getCurrentCurrency();
    
    try {
      const formatter = new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      if (showSymbol) {
        return formatter.format(amount);
      } else {
        // Return just the number formatted without currency symbol
        const numberFormatter = new Intl.NumberFormat(currency.locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        return numberFormatter.format(amount);
      }
    } catch (error) {
      console.error('Error formatting currency:', error);
      // Fallback formatting
      const symbol = showSymbol ? currency.symbol : '';
      return `${symbol}${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  formatAmountWithSymbol(amount: number): string {
    const currency = this.getCurrentCurrency();
    return `${currency.symbol}${this.formatAmount(amount, false)}`;
  }

  getCurrencySymbol(): string {
    return this.getCurrentCurrency().symbol;
  }
}