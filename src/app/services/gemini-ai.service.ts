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
    
    // Try multiple models in order of preference
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    const modelOptions = [
      'gemini-2.0-flash-001',
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-pro',
      'gemini-1.0-pro'
    ];

    for (const modelName of modelOptions) {
      try {
        this.model = this.genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.5,
            topP: 0.8,
            topK: 20,
            maxOutputTokens: 300,
          }
        });
        console.log(`Successfully initialized Gemini model: ${modelName}`);
        return;
      } catch (error) {
        console.warn(`Failed to initialize model ${modelName}:`, error);
        continue;
      }
    }

    // If all models fail, set to null to use local analysis only
    console.warn('All Gemini models failed to initialize. Using local analysis only.');
    this.model = null;
  }

  async getFinancialAdvice(query: string): Promise<AIResponse> {
    const context = await this.getFinancialContext();
    
    // If no model is available, use local analysis
    if (!this.model) {
      console.log('No Gemini model available, using local analysis');
      return this.getLocalAnalysis(query, context);
    }

    try {
      const prompt = this.buildAdvicePrompt(query, context);
      
      console.log('Sending request to Gemini API...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      const responseText = response.text();
      console.log('Received response from Gemini:', responseText);
      
      return this.parseAIResponse(responseText);
      
    } catch (error: any) {
      console.error('Error getting AI advice:', error);
      
      // Fallback to local analysis if API fails
      console.log('Falling back to local analysis due to API error');
      return this.getLocalAnalysis(query, context);
    }
  }

  async analyzeBudget(): Promise<AIResponse> {
    try {
      const context = await this.getFinancialContext();
      const prompt = this.buildBudgetAnalysisPrompt(context);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return this.parseAIResponse(response.text());
      
    } catch (error: any) {
      console.error('Error analyzing budget:', error);
      return {
        message: 'No puedo analizar tu presupuesto en este momento. Por favor verifica tu conexión.',
        suggestions: ['Intenta más tarde', 'Verifica los datos de tu cuenta']
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
      
    } catch (error: any) {
      console.error('Error getting spending insights:', error);
      return {
        message: 'No puedo analizar tus gastos en este momento. Por favor intenta más tarde.',
        suggestions: ['Verifica que tengas transacciones registradas', 'Intenta más tarde']
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
      
    } catch (error: any) {
      console.error('Error getting savings recommendations:', error);
      return {
        message: 'No puedo generar recomendaciones de ahorro en este momento. Por favor intenta más tarde.',
        suggestions: ['Registra más transacciones para mejor análisis', 'Verifica tu conexión']
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
    const savingsRate = context.monthlyIncome > 0 ? (context.monthlyNet / context.monthlyIncome * 100).toFixed(1) : '0';
    
    return `Asesor financiero para Colombia. Responde MÁXIMO 150 palabras.

DATOS: Balance $${context.totalBalance.toLocaleString('es-CO')} COP | Ingresos $${context.monthlyIncome.toLocaleString('es-CO')} | Gastos $${context.monthlyExpenses.toLocaleString('es-CO')} | Ahorro ${savingsRate}%

CONSULTA: "${query}"

RESPONDE:
- Análisis directo en 1-2 frases
- Máximo 3 consejos específicos y cortos
- Una acción concreta para hoy
- Usa los números de sus datos
- Español colombiano, directo y útil

IMPORTANTE: Mantén la respuesta CORTA y PRÁCTICA.`;
  }

  private buildBudgetAnalysisPrompt(context: FinancialContext): string {
    const spendingRatio = context.monthlyIncome > 0 ? (context.monthlyExpenses/context.monthlyIncome*100).toFixed(1) : '0';
    const savingsRate = context.monthlyIncome > 0 ? (context.monthlyNet/context.monthlyIncome*100).toFixed(1) : '0';
    
    // Agrupar transacciones por categoría para análisis
    const expensesByCategory: {[key: string]: number} = {};
    context.recentTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category?.name || 'Sin categoría';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + t.amount;
      });

    return `🏦 ANÁLISIS COMPLETO DE PRESUPUESTO - COLOMBIA

📊 MÉTRICAS CLAVE:
- Balance total: $${context.totalBalance.toLocaleString('es-CO')} COP
- Ingresos mensuales: $${context.monthlyIncome.toLocaleString('es-CO')} COP  
- Gastos mensuales: $${context.monthlyExpenses.toLocaleString('es-CO')} COP
- Balance neto: $${context.monthlyNet.toLocaleString('es-CO')} COP
- Ratio de gastos: ${spendingRatio}% de ingresos
- Tasa de ahorro: ${savingsRate}%

💳 DISTRIBUCIÓN DE CUENTAS:
${context.accounts.map(acc => 
  `- ${acc.name}: $${acc.balance.toLocaleString('es-CO')} COP (${acc.type})`
).join('\n')}

🏷️ GASTOS POR CATEGORÍA (últimas transacciones):
${Object.entries(expensesByCategory)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([category, amount]) => `- ${category}: $${amount.toLocaleString('es-CO')} COP`)
  .join('\n')}

📈 REFERENCIAS COLOMBIA:
- Tasa de ahorro recomendada: 20%
- Gastos esenciales ideales: 50% ingresos
- Gastos no esenciales: 30% ingresos

🎯 ANÁLISIS REQUERIDO:
1. Evalúa la salud financiera vs estándares colombianos
2. Identifica la categoría donde más gasta
3. Calcula cuánto podría ahorrar mensualmente
4. Propón un presupuesto optimizado específico
5. Da metas financieras alcanzables para los próximos 3 meses

Sé específico con números y porcentajes. Incluye advertencias si detectas patrones preocupantes.`;
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

  // Fallback analysis when AI service is not available
  private getLocalAnalysis(query: string, context: FinancialContext): AIResponse {
    const savingsRate = context.monthlyIncome > 0 ? (context.monthlyNet / context.monthlyIncome * 100) : 0;
    const spendingRatio = context.monthlyIncome > 0 ? (context.monthlyExpenses / context.monthlyIncome * 100) : 0;

    // Add local analysis header
    const header = `🤖 Análisis Local: `;

    // Analyze query type and provide appropriate response
    const lowerQuery = query.toLowerCase();
    let result: AIResponse;
    
    if (lowerQuery.includes('presupuesto') || lowerQuery.includes('analiz')) {
      result = this.getBudgetAnalysis(context, savingsRate, spendingRatio);
    } else if (lowerQuery.includes('ahorro') || lowerQuery.includes('ahorrar')) {
      result = this.getSavingsAnalysis(context, savingsRate);
    } else if (lowerQuery.includes('gasto') || lowerQuery.includes('gastar')) {
      result = this.getSpendingAnalysis(context);
    } else if (lowerQuery.includes('salud') || lowerQuery.includes('financiera')) {
      result = this.getFinancialHealthAnalysis(context, savingsRate, spendingRatio);
    } else if (lowerQuery.includes('emergencia')) {
      result = this.getEmergencyAnalysis(context);
    } else {
      // Default analysis
      result = this.getGeneralAnalysis(context, savingsRate, spendingRatio);
    }
    
    // Prepend header to message
    result.message = header + result.message;
    
    // Add note about local analysis
    result.suggestions ??= [];
    result.suggestions.push('💡 Este análisis se basa en tus datos locales');
    
    return result;
  }

  private getBudgetAnalysis(context: FinancialContext, savingsRate: number, spendingRatio: number): AIResponse {
    let message = `Balance: $${context.totalBalance.toLocaleString('es-CO')} COP. `;
    
    if (savingsRate >= 20) {
      message += `Excelente ahorro: ${savingsRate.toFixed(1)}% (meta: 20%).`;
    } else if (savingsRate > 0) {
      message += `Ahorras ${savingsRate.toFixed(1)}%. Objetivo: llegar al 20%.`;
    } else {
      message += `⚠️ No ahorras. Gastas más de lo que ingresas.`;
    }

    const suggestions = [
      savingsRate < 20 ? `Meta: ahorrar 20% ($${(context.monthlyIncome * 0.2).toLocaleString('es-CO')} COP)` : 'Mantén tu tasa de ahorro',
      'Revisa gastos en entretenimiento y comidas',
      'Separa el ahorro apenas recibas ingresos'
    ];

    return { message, suggestions };
  }

  private getSavingsAnalysis(context: FinancialContext, savingsRate: number): AIResponse {
    const monthlyPotential = Math.max(0, context.monthlyNet);
    const emergencyFund = context.monthlyExpenses * 6;
    
    let message;
    if (monthlyPotential > 0) {
      message = `Puedes ahorrar $${monthlyPotential.toLocaleString('es-CO')} COP mensuales. Meta emergencia: $${emergencyFund.toLocaleString('es-CO')} COP.`;
    } else {
      message = `Gastas más de lo que ingresas. Necesitas reducir gastos primero.`;
    }

    const suggestions = [
      monthlyPotential > 0 ? `Ahorra automáticamente $${monthlyPotential.toLocaleString('es-CO')} COP cada mes` : 'Elimina gastos no esenciales',
      'Abre cuenta de ahorros separada',
      `En ${Math.ceil(emergencyFund / Math.max(monthlyPotential, 1))} meses tendrás fondo completo`
    ];

    return { message, suggestions };
  }

  private getSpendingAnalysis(context: FinancialContext): AIResponse {
    const spendingRatio = context.monthlyIncome > 0 ? (context.monthlyExpenses/context.monthlyIncome*100).toFixed(1) : '0';
    const recentExpenses = context.recentTransactions.filter(t => t.type === 'expense');
    
    let message = `Gastas $${context.monthlyExpenses.toLocaleString('es-CO')} COP (${spendingRatio}% de ingresos). `;
    
    if (recentExpenses.length > 0) {
      const avgExpense = recentExpenses.reduce((sum, t) => sum + t.amount, 0) / recentExpenses.length;
      message += `Promedio por gasto: $${avgExpense.toLocaleString('es-CO')} COP.`;
    }

    const suggestions = [
      'Reduce entretenimiento y comidas fuera',
      'Aplica regla 50/30/20 (necesidades/deseos/ahorros)',
      'Compara precios antes de comprar'
    ];

    return { message, suggestions };
  }

  private getFinancialHealthAnalysis(context: FinancialContext, savingsRate: number, spendingRatio: number): AIResponse {
    let healthScore = 0;
    
    // Calculate health score
    if (savingsRate >= 20) healthScore += 30;
    else if (savingsRate >= 10) healthScore += 20;
    else if (savingsRate > 0) healthScore += 10;
    
    if (context.totalBalance >= context.monthlyExpenses * 3) healthScore += 30;
    else if (context.totalBalance >= context.monthlyExpenses) healthScore += 20;
    
    if (spendingRatio <= 70) healthScore += 25;
    else if (spendingRatio <= 80) healthScore += 15;
    
    if (context.accounts.length >= 2) healthScore += 15;

    let message = `Salud financiera: ${healthScore}/100. `;
    
    if (healthScore >= 80) {
      message += `Excelente estado financiero.`;
    } else if (healthScore >= 60) {
      message += `Buen estado, con áreas de mejora.`;
    } else {
      message += `Necesitas mejorar urgentemente.`;
    }

    const suggestions = [
      healthScore < 80 ? `Objetivo: superar 80 puntos` : 'Mantén tus hábitos',
      'Revisa mensualmente tu progreso',
      'Aumenta tu tasa de ahorro al 20%'
    ];

    return { message, suggestions };
  }

  private getEmergencyAnalysis(context: FinancialContext): AIResponse {
    const emergencyFund = context.monthlyExpenses * 6;
    const currentCoverage = context.monthlyExpenses > 0 ? (context.totalBalance / context.monthlyExpenses) : 0;
    
    let message = `Fondo emergencia: tienes $${context.totalBalance.toLocaleString('es-CO')} COP (${currentCoverage.toFixed(1)} meses). Meta: $${emergencyFund.toLocaleString('es-CO')} COP (6 meses). `;
    
    if (currentCoverage >= 6) {
      message += `👍 Fondo completo.`;
    } else if (currentCoverage >= 3) {
      message += `Fondo básico, mejora a 6 meses.`;
    } else {
      message += `⚠️ Fondo insuficiente.`;
    }

    const monthlyTarget = context.monthlyNet > 0 ? Math.ceil((emergencyFund - context.totalBalance) / context.monthlyNet) : 0;

    const suggestions = [
      currentCoverage < 6 ? `Faltan ${(6 - currentCoverage).toFixed(1)} meses de gastos` : 'Mantén el fondo intacto',
      monthlyTarget > 0 ? `Lo alcanzarás en ${monthlyTarget} meses` : 'Necesitas balance positivo primero',
      'Usa cuenta separada para emergencias'
    ];

    return { message, suggestions };
  }

  private getGeneralAnalysis(context: FinancialContext, savingsRate: number, spendingRatio: number): AIResponse {
    let message = `Balance: $${context.totalBalance.toLocaleString('es-CO')} COP. Ahorras ${savingsRate.toFixed(1)}%. Gastas ${spendingRatio.toFixed(1)}% de ingresos. `;
    
    if (savingsRate > 15 && spendingRatio < 75) {
      message += `Situación sólida.`;
    } else {
      message += `Puedes mejorar.`;
    }

    const suggestions = [
      'Revisa presupuesto mensualmente',
      'Aumenta ingresos o reduce gastos',
      'Meta: ahorrar 20% de ingresos'
    ];

    return { message, suggestions };
  }
}