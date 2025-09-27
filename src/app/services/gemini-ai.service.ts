import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupabaseService } from './supabase.service';
import { Transaction, Account } from '../models/finance.models';

interface FinancialContext {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  accounts: Account[];
  recentTransactions: Transaction[];
  monthlyNet: number;
}

interface AIResponse {
  message: string;
  suggestions?: string[];
  actionItems?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private supabaseService: SupabaseService) {
    // TODO: Move to environment variables in production
    const apiKey = 'AIzaSyCGMWbT7xEVd31y8KNItsRVyLmDVD3RZTc';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async getFinancialAdvice(query: string): Promise<AIResponse> {
    try {
      // Get user's financial context
      const context = await this.getFinancialContext();
      
      const prompt = this.buildAdvicePrompt(query, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return this.parseAIResponse(response.text());
      
    } catch (error) {
      console.error('Error getting AI advice:', error);
      return {
        message: 'Lo siento, no puedo procesar tu consulta en este momento. Por favor intenta más tarde.',
        suggestions: []
      };
    }
  }

  async analyzeBudget(): Promise<AIResponse> {
    try {
      const context = await this.getFinancialContext();
      const prompt = this.buildBudgetAnalysisPrompt(context);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return this.parseAIResponse(response.text());
      
    } catch (error) {
      console.error('Error analyzing budget:', error);
      return {
        message: 'No puedo analizar tu presupuesto en este momento.',
        suggestions: []
      };
    }
  }

  async getSpendingInsights(): Promise<AIResponse> {
    try {
      const context = await this.getFinancialContext();
      const prompt = this.buildSpendingInsightsPrompt(context);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return this.parseAIResponse(response.text());
      
    } catch (error) {
      console.error('Error getting spending insights:', error);
      return {
        message: 'No puedo obtener información de gastos en este momento.',
        suggestions: []
      };
    }
  }

  async getSavingsRecommendations(): Promise<AIResponse> {
    try {
      const context = await this.getFinancialContext();
      const prompt = this.buildSavingsPrompt(context);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return this.parseAIResponse(response.text());
      
    } catch (error) {
      console.error('Error getting savings recommendations:', error);
      return {
        message: 'No puedo generar recomendaciones de ahorro en este momento.',
        suggestions: []
      };
    }
  }

  async analyzeTransactionPattern(accountId?: string): Promise<AIResponse> {
    try {
      const context = await this.getFinancialContext();
      let transactions = context.recentTransactions;
      
      if (accountId) {
        transactions = transactions.filter(t => t.account_id === accountId);
      }
      
      const prompt = this.buildPatternAnalysisPrompt(transactions, context);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return this.parseAIResponse(response.text());
      
    } catch (error) {
      console.error('Error analyzing transaction patterns:', error);
      return {
        message: 'No puedo analizar los patrones de transacciones en este momento.',
        suggestions: []
      };
    }
  }

  private async getFinancialContext(): Promise<FinancialContext> {
    const dashboardData = await this.supabaseService.getDashboardData();
    
    return {
      totalBalance: dashboardData.totalBalance,
      monthlyIncome: dashboardData.monthlyIncome,
      monthlyExpenses: dashboardData.monthlyExpenses,
      accounts: dashboardData.accounts,
      recentTransactions: dashboardData.recentTransactions,
      monthlyNet: dashboardData.monthlyNet
    };
  }

  private buildAdvicePrompt(query: string, context: FinancialContext): string {
    return `Eres un asesor financiero experto y amigable. Analiza la situación financiera del usuario y responde su consulta.

CONTEXTO FINANCIERO:
- Balance total: $${context.totalBalance.toFixed(2)}
- Ingresos mensuales: $${context.monthlyIncome.toFixed(2)}
- Gastos mensuales: $${context.monthlyExpenses.toFixed(2)}
- Balance neto mensual: $${context.monthlyNet.toFixed(2)}
- Número de cuentas: ${context.accounts.length}

TRANSACCIONES RECIENTES:
${context.recentTransactions.slice(0, 5).map(t => 
  `- ${t.type === 'income' ? 'Ingreso' : 'Gasto'}: $${t.amount.toFixed(2)} - ${t.category?.name || 'Sin categoría'} - ${t.description || 'Sin descripción'}`
).join('\n')}

CONSULTA DEL USUARIO: "${query}"

INSTRUCCIONES:
1. Responde en español de manera amigable y profesional
2. Usa los datos financieros para dar consejos personalizados
3. Sé conciso pero informativo
4. Incluye sugerencias específicas y accionables
5. Si la consulta no está relacionada con finanzas, redirige amablemente hacia temas financieros

Formato de respuesta: Un párrafo principal con el consejo, seguido de 2-3 sugerencias específicas.`;
  }

  private buildBudgetAnalysisPrompt(context: FinancialContext): string {
    return `Eres un asesor financiero experto. Analiza el presupuesto del usuario y proporciona insights valiosos.

DATOS FINANCIEROS:
- Balance total: $${context.totalBalance.toFixed(2)}
- Ingresos mensuales: $${context.monthlyIncome.toFixed(2)}
- Gastos mensuales: $${context.monthlyExpenses.toFixed(2)}
- Balance neto: $${context.monthlyNet.toFixed(2)}
- Ratio gastos/ingresos: ${context.monthlyIncome > 0 ? (context.monthlyExpenses/context.monthlyIncome*100).toFixed(1) : 0}%

CUENTAS:
${context.accounts.map(acc => 
  `- ${acc.name}: $${acc.balance.toFixed(2)} (${acc.type})`
).join('\n')}

INSTRUCCIONES:
1. Evalúa la salud financiera general
2. Identifica fortalezas y áreas de mejora
3. Proporciona recomendaciones específicas
4. Usa un tono profesional pero amigable
5. Responde en español

Analiza si el usuario está gastando más de lo que gana, si tiene buen balance, y qué puede mejorar.`;
  }

  private buildSpendingInsightsPrompt(context: FinancialContext): string {
    return `Analiza los patrones de gasto del usuario como un asesor financiero experto.

CONTEXTO:
- Gastos mensuales totales: $${context.monthlyExpenses.toFixed(2)}
- Ingresos mensuales: $${context.monthlyIncome.toFixed(2)}
- Transacciones recientes de gastos:

${context.recentTransactions
  .filter(t => t.type === 'expense')
  .slice(0, 10)
  .map(t => `- $${t.amount.toFixed(2)} en ${t.category?.name || 'Sin categoría'}: ${t.description || 'Sin descripción'}`)
  .join('\n')}

INSTRUCCIONES:
1. Identifica patrones en los gastos
2. Encuentra categorías donde más gasta
3. Sugiere optimizaciones específicas
4. Proporciona consejos prácticos para reducir gastos innecesarios
5. Responde en español de forma amigable

Enfócate en insights prácticos que el usuario pueda implementar inmediatamente.`;
  }

  private buildSavingsPrompt(context: FinancialContext): string {
    return `Como asesor financiero experto, analiza la capacidad de ahorro del usuario.

SITUACIÓN FINANCIERA:
- Balance neto mensual: $${context.monthlyNet.toFixed(2)}
- Ingresos: $${context.monthlyIncome.toFixed(2)}
- Gastos: $${context.monthlyExpenses.toFixed(2)}
- Balance total actual: $${context.totalBalance.toFixed(2)}

INSTRUCCIONES:
1. Evalúa la capacidad de ahorro actual
2. Proporciona estrategias específicas para incrementar ahorros
3. Sugiere metas de ahorro realistas
4. Recomienda mejores prácticas financieras
5. Responde en español con un enfoque positivo y motivacional

${context.monthlyNet < 0 ? 
  'El usuario tiene gastos superiores a ingresos, enfócate en estrategias de reducción de gastos.' : 
  'El usuario tiene balance positivo, enfócate en optimización y crecimiento de ahorros.'}`;
  }

  private buildPatternAnalysisPrompt(transactions: Transaction[], context: FinancialContext): string {
    return `Analiza los patrones de transacciones del usuario como un experto en finanzas personales.

TRANSACCIONES PARA ANÁLISIS:
${transactions.slice(0, 15).map(t => 
  `${t.date}: ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)} - ${t.category?.name || 'Sin categoría'} - Cuenta: ${t.account?.name}`
).join('\n')}

CONTEXTO GENERAL:
- Promedio de transacciones por categoría
- Frecuencia de gastos/ingresos
- Cuentas más utilizadas

INSTRUCCIONES:
1. Identifica patrones temporales (días, frecuencia)
2. Analiza distribución por categorías
3. Detecta comportamientos financieros recurrentes
4. Sugiere optimizaciones basadas en los patrones
5. Responde en español de forma clara y accionable

Enfócate en insights que ayuden al usuario a entender mejor sus hábitos financieros.`;
  }

  private parseAIResponse(text: string): AIResponse {
    try {
      return this.extractStructuredResponse(text);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        message: text.trim(),
        suggestions: []
      };
    }
  }

  private extractStructuredResponse(text: string): AIResponse {
    const lines = text.split('\n').filter(line => line.trim());
    let message = '';
    const suggestions: string[] = [];
    const actionItems: string[] = [];
    let currentSection = 'message';

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (this.isSuggestionHeader(trimmed)) {
        currentSection = 'suggestions';
        if (trimmed.match(/^\d+\./)) {
          suggestions.push(trimmed.replace(/^\d+\.\s*/, ''));
        }
      } else if (this.isActionHeader(trimmed)) {
        currentSection = 'actions';
      } else if (this.isBulletPoint(trimmed)) {
        this.addBulletPoint(trimmed, currentSection, suggestions, actionItems);
      } else if (currentSection === 'message' && trimmed.length > 0) {
        message += (message ? ' ' : '') + trimmed;
      }
    }

    return this.buildResponse(message, text, suggestions, actionItems);
  }

  private isSuggestionHeader(text: string): boolean {
    return text.toLowerCase().includes('sugerencias:') || 
           text.toLowerCase().includes('recomendaciones:') ||
           text.match(/^\d+\./) !== null;
  }

  private isActionHeader(text: string): boolean {
    return text.toLowerCase().includes('acciones:') ||
           text.toLowerCase().includes('pasos:');
  }

  private isBulletPoint(text: string): boolean {
    return text.startsWith('- ') || text.startsWith('• ');
  }

  private addBulletPoint(text: string, section: string, suggestions: string[], actionItems: string[]): void {
    const cleaned = text.replace(/^[-•]\s*/, '');
    if (section === 'suggestions') {
      suggestions.push(cleaned);
    } else if (section === 'actions') {
      actionItems.push(cleaned);
    }
  }

  private buildResponse(message: string, originalText: string, suggestions: string[], actionItems: string[]): AIResponse {
    if (suggestions.length === 0 && actionItems.length === 0) {
      message = originalText.trim();
    }
    
    return {
      message: message || originalText.trim(),
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      actionItems: actionItems.length > 0 ? actionItems : undefined
    };
  }
}