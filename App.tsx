
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ClarityCard from './components/ClarityCard';
import KlaritermCard from './components/KlaritermCard';
import KlariPlainCard from './components/KlariPlainCard';
import ChatWidget from './components/ChatWidget';
import AccountabilityLedger from './components/AccountabilityLedger';
import { analyzeStatement, fetchUrlContent } from './services/geminiService';
import { 
  FullAnalysisResponse, 
  KlaritermResponse,
  KlariPlainResponse,
  CalculatedScore, 
  ElementStatus, 
  KlaritexLevel,
  StatementAnalysis,
  AnalysisHistoryItem,
  ModelMode,
  AnalysisPipeline
} from './types';
import { WEIGHTS, STATUS_PENALTY_MULTIPLIER, MAX_SCORE, TIER_THRESHOLDS } from './constants';

const AnalysisSkeleton = ({ mode, pipeline }: { mode: 'default' | 'searching', pipeline: AnalysisPipeline }) => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 h-96 w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-slate-50 dark:via-slate-700/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50">
         {mode === 'searching' ? (
           <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <p className="font-mono text-sm uppercase tracking-widest text-indigo-400">Reading Source URL...</p>
           </>
         ) : (
           <>
             <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
             <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
             <p className="font-mono text-xs uppercase text-slate-400">
               {pipeline === 'lens' ? 'Klarilens Thinking...' : 
                pipeline === 'term' ? 'Klariterm Thinking...' : 
                'KlariPlain Thinking...'}
             </p>
           </>
         )}
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<FullAnalysisResponse | KlaritermResponse | KlariPlainResponse | null>(null);
  const [score, setScore] = useState<CalculatedScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState<'default' | 'searching'>('default');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [modelMode, setModelMode] = useState<ModelMode>('reasoning');
  const [pipeline, setPipeline] = useState<AnalysisPipeline>('lens');
  const [proQueriesLeft, setProQueriesLeft] = useState(50);

  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('clarity_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('clarity_theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    const saved = localStorage.getItem('clarity_ledger');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (newItem: AnalysisHistoryItem) => {
    const newHistory = [newItem, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('clarity_ledger', JSON.stringify(newHistory));
  };

  const calculateScore = (analysisData: StatementAnalysis): CalculatedScore => {
    const els = analysisData.elements;
    let rawPenaltyScore = 0;
    let missingCount = 0;

    const calcElement = (status: ElementStatus, weight: number) => {
      const penalty = STATUS_PENALTY_MULTIPLIER[status];
      if (status === ElementStatus.MISSING) missingCount++;
      return weight * penalty;
    };

    rawPenaltyScore += calcElement(els.who.status as ElementStatus, WEIGHTS.who);
    rawPenaltyScore += calcElement(els.action.status as ElementStatus, WEIGHTS.action);
    rawPenaltyScore += calcElement(els.object.status as ElementStatus, WEIGHTS.object);
    rawPenaltyScore += calcElement(els.measure.status as ElementStatus, WEIGHTS.measure);
    rawPenaltyScore += calcElement(els.when.status as ElementStatus, WEIGHTS.when);
    rawPenaltyScore += calcElement(els.premise.status as ElementStatus, WEIGHTS.premise);

    let finalAmbiguityScore = (rawPenaltyScore / MAX_SCORE) * 10;
    if (els.who.status === ElementStatus.MISSING && els.action.status === ElementStatus.MISSING) finalAmbiguityScore = 10.0;

    let tier = KlaritexLevel.LEVEL_1;
    if (finalAmbiguityScore > TIER_THRESHOLDS.TIER_2_LIMIT || missingCount >= 3) tier = KlaritexLevel.LEVEL_3;
    else if (finalAmbiguityScore > TIER_THRESHOLDS.TIER_1_LIMIT) tier = KlaritexLevel.LEVEL_2;

    return { rawPenaltyScore, finalAmbiguityScore, tier, missingCount, criticalFailure: finalAmbiguityScore === 10 };
  };

  const handleAnalyze = async (text: string, fileData?: { mimeType: string, data: string }, url?: string) => {
    setIsLoading(true);
    setLoadingMode(url ? 'searching' : 'default');
    setError(null);
    setAnalysis(null);
    setScore(null);

    try {
      let contentToAnalyze = text;
      if (url) {
        const retrievedText = await fetchUrlContent(url);
        contentToAnalyze = `[SOURCE: ${url}]\n\n${retrievedText}`;
        setLoadingMode('default');
      }

      const result = await analyzeStatement(contentToAnalyze, fileData, modelMode, pipeline);
      setAnalysis(result);
      
      let computedScore: CalculatedScore | undefined;
      if (pipeline === 'lens' && result && 'statement_analysis' in result) {
        computedScore = calculateScore(result.statement_analysis);
        setScore(computedScore);
      }

      if (modelMode === 'reasoning') setProQueriesLeft(prev => Math.max(0, prev - 1));

      saveToHistory({
        id: Date.now().toString(),
        timestamp: Date.now(),
        text: url || (fileData ? "[PDF Document]" : text.slice(0, 100)),
        score: computedScore,
        analysis: result,
        pipeline
      });

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: any) {
      setError(err.message || "Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: AnalysisHistoryItem) => {
    setPipeline(item.pipeline);
    setAnalysis(item.analysis);
    if (item.score) setScore(item.score);
    else setScore(null);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        currentMode={modelMode}
        setMode={setModelMode}
        pipeline={pipeline}
        setPipeline={setPipeline}
        proQueriesLeft={proQueriesLeft}
      />
      <main className="flex-1 container mx-auto px-4 max-w-4xl py-8 md:py-12">
        <InputSection onAnalyze={handleAnalyze} isLoading={isLoading} />
        {error && (
           <div className="bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-800 dark:text-rose-200 p-4 mb-8 font-mono text-sm rounded-r">
             <p className="font-bold mb-1">Error</p>
             <p>{error}</p>
           </div>
        )}
        <div ref={resultRef}>
          {isLoading && <AnalysisSkeleton mode={loadingMode} pipeline={pipeline} />}
          {analysis && pipeline === 'lens' && score && <ClarityCard analysis={analysis as FullAnalysisResponse} score={score} />}
          {analysis && pipeline === 'term' && <KlaritermCard data={analysis as KlaritermResponse} />}
          {analysis && pipeline === 'plain' && <KlariPlainCard data={analysis as KlariPlainResponse} />}
        </div>
        <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
           <AccountabilityLedger 
            history={history} 
            onSelect={handleSelectHistory} 
            onClear={() => { setHistory([]); localStorage.removeItem('clarity_ledger'); }} 
          />
        </div>
      </main>
      <ChatWidget />
    </div>
  );
};

export default App;
