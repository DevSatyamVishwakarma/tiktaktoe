import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getFinancialAdviceStream } from '../services/geminiService';
import { SIPInputs, SIPResult, AnalysisStatus } from '../types';

interface SmartAnalysisProps {
  inputs: SIPInputs;
  results: SIPResult;
}

export const SmartAnalysis: React.FC<SmartAnalysisProps> = ({ inputs, results }) => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [analysis, setAnalysis] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track if current request is stale when inputs change
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleAnalyze = async () => {
    setStatus(AnalysisStatus.LOADING);
    setAnalysis('');
    setError(null);
    
    // Cleanup previous streams if any (though we can't truly cancel the fetch promise easily without fetch signal, 
    // we can ignore the output)
    
    try {
      await getFinancialAdviceStream(inputs, results, (textChunk) => {
        setAnalysis((prev) => prev + textChunk);
      });
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err) {
      setError("Unable to connect to Gemini AI. Please check your API key or try again later.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  // Reset status when key inputs change drastically, or keep previous analysis but show it might be stale?
  // Let's reset to IDLE to encourage re-analysis for new numbers.
  useEffect(() => {
    if (status === AnalysisStatus.SUCCESS || status === AnalysisStatus.ERROR) {
       // Optional: Auto-refresh or just let user click? Let's let user click to save tokens.
       setStatus(AnalysisStatus.IDLE); 
       setAnalysis('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs.monthlyInvestment, inputs.expectedReturnRate, inputs.timePeriodYears, inputs.inflationRate]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Smart AI Insights</h3>
            <p className="text-xs text-slate-500">Powered by Gemini 2.5</p>
          </div>
        </div>
        
        {status !== AnalysisStatus.LOADING && (
          <button
            onClick={handleAnalyze}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            {status === AnalysisStatus.IDLE ? 'Analyze Plan' : 'Re-Analyze'}
            <Bot className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-6 min-h-[150px]">
        {status === AnalysisStatus.IDLE && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-slate-400">
            <Bot className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">Click "Analyze Plan" to get personalized insights about your investment strategy.</p>
          </div>
        )}

        {status === AnalysisStatus.LOADING && (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            <div className="h-4 bg-slate-100 rounded w-full"></div>
            <div className="h-4 bg-slate-100 rounded w-5/6"></div>
            <div className="flex items-center justify-center pt-4 text-xs text-indigo-500 font-medium">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Gemini is thinking...
            </div>
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
          <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {(status === AnalysisStatus.SUCCESS || (status === AnalysisStatus.LOADING && analysis)) && (
          <div className="prose prose-sm prose-indigo max-w-none text-slate-700">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};