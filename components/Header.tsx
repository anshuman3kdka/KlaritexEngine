
import React from 'react';
import { ModelMode, AnalysisPipeline } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentMode: ModelMode;
  setMode: (mode: ModelMode) => void;
  pipeline: AnalysisPipeline;
  setPipeline: (pipeline: AnalysisPipeline) => void;
  proQueriesLeft: number;
}

const Header: React.FC<HeaderProps> = ({ 
  isDarkMode, 
  toggleDarkMode, 
  currentMode, 
  setMode,
  pipeline,
  setPipeline,
  proQueriesLeft
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 md:py-6 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">KLARITEX</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">Structural Analysis Engine</p>
        </div>

        {/* Pipeline Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full shadow-inner">
          <button 
            onClick={() => setPipeline('lens')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase transition-all ${pipeline === 'lens' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Klarilens
          </button>
          <button 
            onClick={() => setPipeline('term')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase transition-all ${pipeline === 'term' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Klariterm
          </button>
          <button 
            onClick={() => setPipeline('plain')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase transition-all ${pipeline === 'plain' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            KlariPlain
          </button>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center shadow-inner">
            <button
              onClick={() => setMode('reasoning')}
              className={`relative px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all flex flex-col items-center min-w-[80px]
                ${currentMode === 'reasoning' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span>Deep Thinking</span>
              <span className={`text-[9px] mt-0.5 ${proQueriesLeft === 0 ? 'text-rose-500' : 'opacity-60'}`}>Pro 3 ({proQueriesLeft})</span>
            </button>
            <button
              onClick={() => setMode('quick')}
              className={`relative px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all flex flex-col items-center min-w-[80px]
                ${currentMode === 'quick' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span>Quick Thinking</span>
              <span className="opacity-60 text-[9px] mt-0.5">Flash 3 (∞)</span>
            </button>
          </div>
           
           <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
             {isDarkMode ? (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
             )}
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
