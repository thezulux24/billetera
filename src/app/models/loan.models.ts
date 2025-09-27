export interface LoanCalculation {
  id?: string;
  user_id?: string;
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  amortizationSchedule: AmortizationEntry[];
  created_at?: string;
}

export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface CreditSimulationRequest {
  loanAmount: number;
  interestRate: number;
  termYears: number;
  paymentFrequency: 'monthly' | 'biweekly' | 'weekly';
}

export interface ComparisonScenario {
  name: string;
  calculation: LoanCalculation;
  color: string;
}