import { GoogleGenAI } from "@google/genai";
import { SIPInputs, SIPResult } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

export const getFinancialAdviceStream = async (
  inputs: SIPInputs,
  results: SIPResult,
  onChunk: (text: string) => void
): Promise<void> => {
  if (!GEMINI_API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const prompt = `
    As an expert financial advisor, analyze this Systematic Investment Plan (SIP) scenario:
    
    User Inputs:
    - Monthly Investment: $${inputs.monthlyInvestment}
    - Expected Annual Return: ${inputs.expectedReturnRate}%
    - Duration: ${inputs.timePeriodYears} years
    - Expected Inflation Rate: ${inputs.inflationRate}%

    Calculated Results:
    - Total Invested Capital: $${results.investedAmount.toLocaleString()}
    - Estimated Wealth Generated (Returns): $${results.estimatedReturns.toLocaleString()}
    - Final Maturity Value (Nominal): $${results.totalValue.toLocaleString()}
    - Inflation Adjusted Value (Real Purchasing Power): $${results.inflationAdjustedValue.toLocaleString()}

    Please provide a concise but insightful analysis in markdown format. Structure it as follows:
    1. **Viability Check**: Is the ${inputs.expectedReturnRate}% return realistic for the given timeframe?
    2. **Inflation Reality**: With ${inputs.inflationRate}% inflation, the real purchasing power is approx $${results.inflationAdjustedValue.toLocaleString()}. Explain what this effectively buys in today's terms compared to the nominal value.
    3. **Actionable Advice**: Suggest 1-2 strategies (e.g., step-up SIP, diversification) to maximize wealth or beat inflation.
    
    Keep the tone encouraging but realistic. Use formatting like bolding for key numbers.
  `;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response on simple analysis
      }
    });

    for await (const chunk of response) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error fetching Gemini advice:", error);
    throw error;
  }
};