export interface SIPInputs {
  monthlyInvestment: number;
  expectedReturnRate: number;
  timePeriodYears: number;
  inflationRate: number;
}

export interface SIPResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
  inflationAdjustedValue: number;
  yearlyBreakdown: Array<{
    year: number;
    invested: number;
    value: number;
  }>;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface AIAnalysisResponse {
  markdown: string;
}