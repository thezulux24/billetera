import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GeminiAIService } from '../../services/gemini-ai.service';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  suggestions?: string[];
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./ai-assistant.component.css'],
  styles: [`
    .message-content {
      word-wrap: break-word;
      word-break: break-word;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
      max-width: none !important;
    }
    .message-assistant .flex-1 {
      min-width: 0;
      width: 100%;
    }
    .chat-container {
      width: 100%;
      overflow-x: hidden;
    }
  `],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <!-- Header -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-violet-100 dark:border-gray-700">
        <div class="px-4 py-6">
          <div class="flex items-center justify-between">
            <button (click)="goBack()" class="p-2 -ml-2 rounded-2xl hover:bg-violet-100 dark:hover:bg-gray-700 transition-all">
              <svg class="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="flex items-center">
              <div class="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-3 mr-3">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">Asistente Financiero IA</h1>
                <p class="text-sm text-gray-600 dark:text-gray-400">Powered by Gemini AI</p>
              </div>
            </div>
            <button 
              (click)="clearChat()"
              class="p-2 rounded-2xl text-gray-500 hover:bg-violet-100 dark:hover:bg-gray-700 transition-all"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="p-4 bg-white/50 dark:bg-gray-800/50 border-b border-violet-100 dark:border-gray-700">
        <div class="flex space-x-2 overflow-x-auto pb-2">
          <button
            *ngFor="let action of quickActions"
            (click)="sendQuickAction(action.prompt)"
            class="flex items-center px-4 py-2 bg-white dark:bg-gray-700 rounded-2xl border border-violet-200 dark:border-gray-600 hover:bg-violet-50 dark:hover:bg-gray-600 transition-all whitespace-nowrap"
          >
            <span [innerHTML]="action.icon" class="w-4 h-4 mr-2"></span>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ action.label }}</span>
          </button>
        </div>
      </div>

      <!-- Chat Messages -->
      <div class="flex-1 overflow-hidden">
        <div #messagesContainer class="h-full overflow-y-auto p-4 chat-container">
          <!-- Welcome Message -->
          <div *ngIf="messages.length === 0" class="text-center py-12">
            <div class="bg-gradient-to-r from-violet-500 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">¡Hola! Soy tu asistente financiero</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Puedo ayudarte a analizar tus finanzas, dar consejos de ahorro, y responder cualquier pregunta sobre tu dinero.
            </p>
            <p class="text-sm text-violet-600 dark:text-violet-400">
              Usa las sugerencias de arriba o escribe tu pregunta abajo
            </p>
          </div>

          <!-- Chat Messages -->
          <div class="space-y-4 w-full">
            <div *ngFor="let message of messages; trackBy: trackByMessageId" class="w-full">
              
              <!-- User Message (Right Side) -->
              <div *ngIf="message.type === 'user'" class="flex justify-end mb-4 message-user">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-3xl rounded-br-lg px-6 py-4 shadow-lg max-w-[80%]">
                  <p class="font-medium">{{ message.content }}</p>
                  <p class="text-xs text-blue-100 mt-2">{{ formatTime(message.timestamp) }} - Usuario</p>
                </div>
              </div>
              
              <!-- Assistant Message (Left Side) -->
              <div *ngIf="message.type === 'assistant'" class="flex justify-start mb-4 message-assistant">
                <div class="flex items-start space-x-3 w-full max-w-none">
                  <div class="bg-gradient-to-r from-violet-500 to-purple-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="bg-white dark:bg-gray-700 rounded-3xl rounded-bl-lg px-6 py-4 shadow-lg border border-violet-100 dark:border-gray-600 w-full">
                      
                      <!-- Loading State -->
                      <div *ngIf="message.isLoading" class="flex items-center space-x-2">
                        <div class="flex space-x-1">
                          <div class="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
                          <div class="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                          <div class="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                        </div>
                        <span class="text-sm text-gray-500 dark:text-gray-400">🤖 Analizando tus datos...</span>
                      </div>
                      
                      <!-- Message Content -->
                      <div *ngIf="!message.isLoading" class="w-full">
                        <div class="message-content text-gray-800 dark:text-gray-200 leading-relaxed">{{ message.content }}</div>
                        
                        <!-- Suggestions -->
                        <div *ngIf="message.suggestions && message.suggestions.length > 0" class="mt-4 space-y-2">
                          <h4 class="text-sm font-semibold text-violet-600 dark:text-violet-400">💡 Sugerencias:</h4>
                          <ul class="space-y-1">
                            <li *ngFor="let suggestion of message.suggestions" 
                                class="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                              <span class="text-violet-500 mr-2 flex-shrink-0">•</span>
                              <span class="flex-1 word-wrap break-words">{{ suggestion }}</span>
                            </li>
                          </ul>
                        </div>
                        
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">{{ formatTime(message.timestamp) }} - IA</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-violet-100 dark:border-gray-700 p-4">
        <form [formGroup]="messageForm" (ngSubmit)="sendMessage()" class="flex space-x-3">
          <div class="flex-1 relative">
            <input
              #messageInput
              type="text"
              formControlName="message"
              placeholder="Pregúntame sobre tus finanzas..."
              class="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-violet-200 dark:border-gray-600 rounded-3xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
            />
          </div>
          <button
            type="submit"
            class="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white p-4 rounded-3xl shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:transform-none"
          >
            <svg 
              *ngIf="!isLoading" 
              class="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            <svg 
              *ngIf="isLoading" 
              class="w-6 h-6 animate-spin" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  `
})
export class AIAssistantComponent implements OnInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  messageForm: FormGroup;
  messages: ChatMessage[] = [];
  isLoading = false;

  quickActions = [
    {
      label: 'Analizar Presupuesto',
      prompt: 'Analiza mi presupuesto completo con todos mis datos financieros actuales. Incluye mi balance, ingresos, gastos por categoría y tasa de ahorro. Dame recomendaciones específicas para Colombia.',
      icon: '📊'
    },
    {
      label: 'Optimizar Gastos',
      prompt: 'Revisa mis gastos recientes y encuentra exactamente dónde estoy gastando más. Dame estrategias concretas para reducir gastos en mis categorías más costosas.',
      icon: '✂️'
    },
    {
      label: 'Plan de Ahorro',
      prompt: 'Basado en mi situación financiera actual, crea un plan de ahorro específico con metas mensuales alcanzables. Incluye estrategias para aumentar mi tasa de ahorro.',
      icon: '🎯'
    },
    {
      label: 'Salud Financiera',
      prompt: 'Evalúa mi salud financiera general comparándola con estándares para Colombia. Identifica mis fortalezas y las áreas más urgentes que debo mejorar.',
      icon: '💚'
    },
    {
      label: 'Emergencias',
      prompt: 'Analiza si tengo suficiente dinero para emergencias y ayúdame a crear un fondo de emergencia basado en mis gastos mensuales actuales.',
      icon: '🚨'
    }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly geminiService: GeminiAIService,
    private readonly router: Router
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    // Focus input on load
    setTimeout(() => {
      this.messageInput?.nativeElement?.focus();
    }, 100);
  }

  async sendMessage() {
    if (this.messageForm.valid && !this.isLoading) {
      const userMessage = this.messageForm.get('message')?.value.trim();
      
      if (userMessage) {
        // Add user message first
        this.addMessage('user', userMessage);
        console.log('User message added');
        
        // Clear form and disable it immediately
        this.messageForm.reset();
        this.messageForm.disable();
        this.isLoading = true;
        
        // Add loading assistant message with a unique timestamp-based ID
        const assistantId = `assistant_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const assistantMessage: ChatMessage = {
          id: assistantId,
          type: 'assistant',
          content: '',
          timestamp: new Date(),
          isLoading: true
        };
        
        this.messages.push(assistantMessage);
        console.log('Assistant loading message added:', assistantMessage);
        this.scrollToBottom();

        try {
          // Get AI response
          const response = await this.geminiService.getFinancialAdvice(userMessage);
          console.log('AI response received:', response);
          
          // Update the assistant message directly
          const messageToUpdate = this.messages.find(m => m.id === assistantId);
          if (messageToUpdate && messageToUpdate.type === 'assistant') {
            console.log('Full AI response content:', response.message);
            console.log('AI response length:', response.message.length);
            messageToUpdate.content = response.message;
            messageToUpdate.isLoading = false;
            messageToUpdate.suggestions = response.suggestions;
            console.log('Assistant message updated with content length:', messageToUpdate.content.length);
            this.scrollToBottom();
          } else {
            console.error('Assistant message not found or wrong type:', messageToUpdate);
          }
          
        } catch (error) {
          console.error('Error getting AI response:', error);
          const messageToUpdate = this.messages.find(m => m.id === assistantId);
          if (messageToUpdate && messageToUpdate.type === 'assistant') {
            messageToUpdate.content = 'Lo siento, hubo un error al procesar tu consulta. Por favor intenta de nuevo.';
            messageToUpdate.isLoading = false;
            this.scrollToBottom();
          }
        } finally {
          this.isLoading = false;
          this.messageForm.enable();
          setTimeout(() => {
            this.messageInput?.nativeElement?.focus();
          }, 100);
        }
      }
    }
  }

  sendQuickAction(prompt: string) {
    this.messageForm.patchValue({ message: prompt });
    this.sendMessage();
  }

  addMessage(type: 'user' | 'assistant', content: string, loading = false): string {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const message: ChatMessage = {
      id,
      type,
      content,
      timestamp: new Date(),
      isLoading: loading
    };

    console.log('Adding message:', { type, content, loading, id, messageType: message.type });
    this.messages.push(message);
    console.log('Current messages:', this.messages.map(m => ({ id: m.id, type: m.type, contentLength: m.content.length })));
    this.scrollToBottom();
    return id;
  }

  updateMessage(id: string, content: string, loading = false, suggestions?: string[]) {
    const message = this.messages.find(m => m.id === id);
    if (message) {
      console.log('Updating message:', { id, originalType: message.type, contentLength: content.length, loading });
      
      // Extra validation to ensure we don't change message type accidentally
      if (message.type === 'assistant') {
        message.content = content;
        message.isLoading = loading;
        message.suggestions = suggestions;
        console.log('Assistant message updated successfully');
      } else {
        console.error('Attempted to update non-assistant message:', message);
      }
      this.scrollToBottom();
    } else {
      console.error('Message not found for ID:', id);
    }
  }

  clearChat() {
    this.messages = [];
    this.messageInput?.nativeElement?.focus();
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}