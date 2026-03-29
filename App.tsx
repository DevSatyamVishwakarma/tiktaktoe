import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, DollarSign, TrendingUp, Calendar, ChevronRight, TrendingDown } from 'lucide-react';
import { SIPInputs, SIPResult } from './types';
import { GrowthChart, BreakdownChart } from './components/Charts';
import { SmartAnalysis } from './components/SmartAnalysis';

const App: React.FC = () => {
  // --- State ---
  const [inputs, setInputs] = useState<SIPInputs>({
    monthlyInvestment: 5000,
    expectedReturnRate: 12,
    timePeriodYears: 10,
    inflationRate: 6,
  });

  // --- Calculation Logic ---
  const results: SIPResult = useMemo(() => {
    const { monthlyInvestment, expectedReturnRate, timePeriodYears, inflationRate } = inputs;
    
    const monthlyRate = expectedReturnRate / 12 / 100;
    const months = timePeriodYears * 12;
    
    // SIP Formula: P * ({ (1 + i)^n - 1 } / i) * (1 + i)
    // where P = Monthly Investment, i = Monthly Rate, n = Months
    
    let futureValue = 0;
    let investedAmount = 0;
    const yearlyBreakdown = [];

    // Calculate year by year for chart data
    
    if (expectedReturnRate === 0) {
      investedAmount = monthlyInvestment * months;
      futureValue = investedAmount;
      for (let i = 1; i <= timePeriodYears; i++) {
        yearlyBreakdown.push({
          year: i,
          invested: monthlyInvestment * 12 * i,
          value: monthlyInvestment * 12 * i
        });
      }
    } else {
        // Standard SIP formula for final value
        futureValue = monthlyInvestment * ( (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate ) * (1 + monthlyRate);
        investedAmount = monthlyInvestment * months;

        // Generate Breakdown
        // We iterate purely for the chart points (yearly)
        for (let i = 1; i <= timePeriodYears; i++) {
            const monthsPassed = i * 12;
            const val = monthlyInvestment * ( (Math.pow(1 + monthlyRate, monthsPassed) - 1) / monthlyRate ) * (1 + monthlyRate);
            yearlyBreakdown.push({
                year: i,
                invested: monthlyInvestment * 12 * i,
                value: Math.round(val)
            });
        }
    }

    // Calculate Inflation Adjusted Value
    // Formula: Real Value = Future Value / (1 + inflation/100)^years
    const inflationAdjustedValue = futureValue / Math.pow(1 + inflationRate / 100, timePeriodYears);

    return {
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(futureValue - investedAmount),
      totalValue: Math.round(futureValue),
      inflationAdjustedValue: Math.round(inflationAdjustedValue),
      yearlyBreakdown
    };
  }, [inputs]);

  // --- Handlers ---
  const handleInputChange = (field: keyof SIPInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-2 rounded-lg">
               <Calculator className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-brand-500">
              Smart SIP
            </h1>
          </div>
          <a href="https://ai.google.dev/" target="_blank" rel="noreferrer" className="text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors">
            Built with Gemini API
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs & Summary Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Input Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                Configuration
              </h2>
              
              <div className="space-y-8">
                {/* Monthly Investment */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Monthly Investment
                    </label>
                    <div className="bg-brand-50 px-3 py-1 rounded-md text-brand-700 font-bold font-mono">
                      ${inputs.monthlyInvestment.toLocaleString()}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="100000"
                    step="500"
                    value={inputs.monthlyInvestment}
                    onChange={(e) => handleInputChange('monthlyInvestment', Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>$500</span>
                    <span>$100k</span>
                  </div>
                </div>

                {/* Expected Return Rate */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Expected Return (p.a)
                    </label>
                    <div className="bg-emerald-50 px-3 py-1 rounded-md text-emerald-700 font-bold font-mono">
                      {inputs.expectedReturnRate}%
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="0.1"
                    value={inputs.expectedReturnRate}
                    onChange={(e) => handleInputChange('expectedReturnRate', Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>1%</span>
                    <span>30%</span>
                  </div>
                </div>

                {/* Time Period */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Time Period
                    </label>
                    <div className="bg-indigo-50 px-3 py-1 rounded-md text-indigo-700 font-bold font-mono">
                      {inputs.timePeriodYears} Yr
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="1"
                    value={inputs.timePeriodYears}
                    onChange={(e) => handleInputChange('timePeriodYears', Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>1 Yr</span>
                    <span>40 Yr</span>
                  </div>
                </div>

                {/* Inflation Rate */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" /> Inflation Rate (p.a)
                    </label>
                    <div className="bg-amber-50 px-3 py-1 rounded-md text-amber-700 font-bold font-mono">
                      {inputs.inflationRate}%
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={inputs.inflationRate}
                    onChange={(e) => handleInputChange('inflationRate', Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>0%</span>
                    <span>15%</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Results Grid - Mobile/Tablet Optimized */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                 <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Invested Amount</p>
                 <p className="text-xl sm:text-2xl font-bold text-slate-800">${results.investedAmount.toLocaleString()}</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                 <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Est. Returns</p>
                 <p className="text-xl sm:text-2xl font-bold text-emerald-600">+${results.estimatedReturns.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-brand-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-700 rounded-full opacity-50 blur-xl"></div>
               <div className="relative z-10">
                 <p className="text-brand-200 text-sm font-medium mb-1">Total Value</p>
                 <p className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">${results.totalValue.toLocaleString()}</p>
                 
                 <div className="pt-4 border-t border-brand-700/50 flex flex-col gap-1">
                    <div className="flex justify-between items-end">
                       <p className="text-xs text-brand-300">Inflation Adjusted ({inputs.inflationRate}%)</p>
                       <p className="text-lg font-semibold text-white">${results.inflationAdjustedValue.toLocaleString()}</p>
                    </div>
                    <p className="text-[10px] text-brand-400">Purchasing power in today's money</p>
                 </div>
               </div>
            </div>

          </div>

          {/* Right Column: Visualizations & AI */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-2">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                        <ChevronRight className="w-4 h-4 text-brand-500" />
                        Projected Growth
                    </h3>
                    <GrowthChart data={results} />
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                        <ChevronRight className="w-4 h-4 text-brand-500" />
                        Distribution
                    </h3>
                    <BreakdownChart data={results} />
                </div>

                {/* Key Metrics Quick View */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center space-y-4">
                   <div>
                       <div className="flex justify-between text-sm mb-1">
                           <span className="text-slate-500">Wealth Gain Ratio</span>
                           <span className="font-bold text-slate-800">
                               {results.investedAmount > 0 ? ((results.estimatedReturns / results.investedAmount) * 100).toFixed(1) : 0}%
                           </span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-2">
                           <div 
                             className="bg-emerald-500 h-2 rounded-full" 
                             style={{ width: `${Math.min(100, (results.estimatedReturns / results.totalValue) * 100)}%` }}
                           ></div>
                       </div>
                   </div>
                   
                   <div>
                       <div className="flex justify-between text-sm mb-1">
                           <span className="text-slate-500">Monthly Growth Req.</span>
                           <span className="font-bold text-slate-800">
                               ${(results.estimatedReturns / (inputs.timePeriodYears * 12)).toFixed(0)}/mo
                           </span>
                       </div>
                       <p className="text-xs text-slate-400">Avg. gain needed per month to hit target.</p>
                   </div>
                </div>
            </div>

            {/* Smart Analysis Section */}
            <SmartAnalysis inputs={inputs} results={results} />

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;