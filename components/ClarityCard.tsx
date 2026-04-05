
import React, { useState, useEffect, useRef } from 'react';
import { AnalysisElement, CalculatedScore, ElementStatus, FullAnalysisResponse, KlaritexLevel, RhetoricDensity } from '../types';
import { ELEMENT_DEFINITIONS, HUMAN_LABELS } from '../constants';

interface ClarityCardProps {
  analysis: FullAnalysisResponse;
  score: CalculatedScore;
}

const STATUS_LABELS = {
  [ElementStatus.CLEAR]: "Locked In",
  [ElementStatus.BROAD]: "Unclear",
  [ElementStatus.MISSING]: "Missing"
};

const ELEMENT_CLARIFICATIONS: Record<string, string> = {
  who: "The specific person or group doing the work.",
  action: "The real-world event that actually happens.",
  object: "The person or thing receiving the action.",
  measure: "The proof we use to know if it happened.",
  when: "The specific time or deadline.",
  premise: "The facts or rules this is based on."
};

const StatusIcon: React.FC<{ status: ElementStatus; className?: string }> = ({ status, className }) => {
  switch (status) {
    case ElementStatus.CLEAR:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-emerald-600 dark:text-emerald-500 ${className}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    case ElementStatus.BROAD:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-amber-500 ${className}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case ElementStatus.MISSING:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-rose-500 ${className}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    default:
      return null;
  }
};

const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const StickyPill: React.FC<{ score: CalculatedScore }> = ({ score }) => {
  return (
    <div className="sticky top-4 z-40 flex justify-center pointer-events-none animate-fade-in-up">
      <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 border border-slate-700 pointer-events-auto transition-transform hover:scale-105">
        <span className={`text-xs font-bold font-mono uppercase px-1.5 py-0.5 rounded text-slate-900 
          ${score.tier === KlaritexLevel.LEVEL_1 ? 'bg-emerald-400' : 
            score.tier === KlaritexLevel.LEVEL_2 ? 'bg-amber-400' : 
            'bg-rose-400'}`}>
          {score.tier.split(' ')[0]} {score.tier.split(' ')[1]}
        </span>
        <span className="font-mono font-bold text-sm">{score.finalAmbiguityScore.toFixed(1)}</span>
      </div>
    </div>
  );
};

const RhetoricMeter: React.FC<{ data: RhetoricDensity }> = ({ data }) => {
  if (!data) return null;

  const { rhetorical_percentage, binding_count, rhetorical_count } = data;
  const binding_percentage = 100 - rhetorical_percentage;

  return (
    <div className="mb-8 p-5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg animate-fade-in-up">
      <div className="flex justify-between items-end mb-3">
        <div>
          <h3 className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-2">
            Action vs. Talk
            <div className="group relative">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-sans leading-tight">
                 How much is real action and how much is just words.
               </div>
            </div>
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5 italic">Ratio of fluff to real verbs.</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{rhetorical_percentage}%</span>
          <span className="text-[10px] font-mono text-slate-500 uppercase ml-1">Just Talk</span>
        </div>
      </div>

      <div className="relative h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner flex">
        <div 
          style={{ width: `${rhetorical_percentage}%` }} 
          className="h-full bg-slate-400 dark:bg-slate-500 relative transition-all duration-1000 ease-out"
        >
          {rhetorical_percentage > 15 && (
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/90 uppercase tracking-tighter">
              Talk ({rhetorical_count})
            </span>
          )}
        </div>
        
        <div 
          style={{ width: `${binding_percentage}%` }} 
          className="h-full bg-indigo-500 dark:bg-indigo-400 relative transition-all duration-1000 ease-out"
        >
          {binding_percentage > 15 && (
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/90 uppercase tracking-tighter">
              Action ({binding_count})
            </span>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-400 uppercase">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"></div>
          <span>Just Talk</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>
          <span>Locked In</span>
        </div>
      </div>
    </div>
  );
};

const ChecklistItem: React.FC<{ 
  id: string; 
  title: string; 
  element: AnalysisElement; 
  isStressTest: boolean 
}> = ({ id, title, element, isStressTest }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDimmed = isStressTest && element.status !== ElementStatus.CLEAR;
  
  return (
    <div 
      className={`border-b border-slate-100 dark:border-slate-700 last:border-0 transition-all duration-300 
        ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}
        ${isOpen ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center p-4 text-left focus:outline-none group"
      >
        <div className="mr-3 mt-0.5">
          <StatusIcon status={element.status} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <h4 className="text-sm font-medium font-sans text-slate-900 dark:text-slate-200 group-hover:text-slate-700 dark:group-hover:text-white transition-colors">
                {title}
              </h4>
              <p className="text-[9px] text-slate-500 dark:text-slate-500 font-sans italic leading-none mt-1">
                {ELEMENT_CLARIFICATIONS[id]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm
                ${element.status === ElementStatus.CLEAR ? 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                  element.status === ElementStatus.BROAD ? 'bg-amber-100/50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400' :
                  'bg-rose-100/50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400'}`}>
                {STATUS_LABELS[element.status]}
              </span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {!isOpen && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1 truncate pr-4">
              {element.content || "Not specified"}
            </p>
          )}
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 pl-12">
          <p className="text-sm text-slate-800 dark:text-slate-200 font-sans font-medium mb-2 leading-relaxed">
            "{element.content || "N/A"}"
          </p>
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
            <div className="flex items-start gap-2">
               <span className="text-[10px] font-mono uppercase text-slate-400 mt-0.5">Rule:</span>
               <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                 {ELEMENT_DEFINITIONS[id as keyof typeof ELEMENT_DEFINITIONS]}
               </p>
            </div>
            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
               <span className="text-[10px] font-mono uppercase text-slate-400 mt-0.5">Analysis:</span>
               <p className="text-xs text-slate-600 dark:text-slate-300 font-mono leading-relaxed">
                 {isDimmed ? "This part lacks structural anchors." : element.reasoning}
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClarityCard: React.FC<ClarityCardProps> = ({ analysis, score }) => {
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [stressTestMode, setStressTestMode] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [showWorstLines, setShowWorstLines] = useState(false);
  // Add missing showVerification state
  const [showVerification, setShowVerification] = useState(false);
  
  const verdictRef = useRef<HTMLDivElement>(null);
  const worstLineRef = useRef<HTMLDivElement>(null);

  const { statement_analysis } = analysis;
  const elements = statement_analysis.elements;
  const clearCount = (Object.values(elements) as AnalysisElement[]).filter(e => e.status === ElementStatus.CLEAR).length;
  const verifications = statement_analysis.verification_requirements || [];
  const risk = statement_analysis.risk_profile;
  const rhetoric = statement_analysis.rhetoric_density;

  const isDocumentAnalysis = risk && (risk.tier_1_count + risk.tier_2_count + risk.tier_3_count > 1);
  const totalClaims = risk ? risk.tier_1_count + risk.tier_2_count + risk.tier_3_count : 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSticky(!entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    if (verdictRef.current) observer.observe(verdictRef.current);
    return () => { if (verdictRef.current) observer.unobserve(verdictRef.current); };
  }, []);

  const handleShare = () => {
    const text = `Klarilens Result: ${score.tier}. ${analysis.literal_translation}`;
    if (navigator.share) {
      navigator.share({ title: 'Klarilens Result', text }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard.");
    }
  };

  const handleShowWorst = () => {
    setShowWorstLines(true);
    setTimeout(() => { worstLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
  };

  const renderHighlightedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 font-semibold px-1 py-0.5 rounded-sm box-decoration-clone">{part.slice(2, -2)}</span>;
      }
      return <span key={i} className="text-slate-400 dark:text-slate-500 transition-opacity duration-500">{part}</span>;
    });
  };

  return (
    <div className="space-y-6 relative pb-24">
      {showSticky && <StickyPill score={score} />}

      <div ref={verdictRef} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden animate-fade-in-up transition-colors duration-300">
        <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">Klarilens Result</span>
            <div className={`text-xl md:text-2xl font-bold font-mono uppercase flex items-center gap-2 tracking-tight
              ${score.tier === KlaritexLevel.LEVEL_1 ? 'text-emerald-700 dark:text-emerald-400' : 
                score.tier === KlaritexLevel.LEVEL_2 ? 'text-amber-600 dark:text-amber-400' : 
                'text-rose-600 dark:text-rose-400'}`}>
               {score.tier === KlaritexLevel.LEVEL_1 ? <StatusIcon status={ElementStatus.CLEAR} className="h-6 w-6" /> : 
                score.tier === KlaritexLevel.LEVEL_2 ? <StatusIcon status={ElementStatus.BROAD} className="h-6 w-6" /> : 
                <StatusIcon status={ElementStatus.MISSING} className="h-6 w-6" />}
               {score.tier}
            </div>
          </div>
          <div className="text-right">
             <div className="text-4xl font-bold font-mono text-slate-900 dark:text-white tracking-tighter">{score.finalAmbiguityScore.toFixed(1)}</div>
             <div className="text-[10px] font-mono uppercase text-slate-400 mt-1">Ambiguity Score</div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {isDocumentAnalysis && risk && (
            <div className="mb-8 p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider">Exposure Check</h3>
                  <p className="text-[9px] text-slate-500 italic mt-1 font-sans">Concentration of consequences in the text.</p>
                </div>
                <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                  {totalClaims} Items Checked
                </span>
              </div>
              
              <div className="flex h-6 w-full rounded-md overflow-hidden mb-4 shadow-sm">
                <div style={{ width: `${(risk.tier_1_count / totalClaims) * 100}%` }} className="bg-emerald-500 h-full relative group"></div>
                <div style={{ width: `${(risk.tier_2_count / totalClaims) * 100}%` }} className="bg-amber-500 h-full relative group"></div>
                <div style={{ width: `${(risk.tier_3_count / totalClaims) * 100}%` }} className="bg-rose-500 h-full relative group"></div>
              </div>
              
              <div className="flex justify-between text-[10px] font-mono uppercase text-slate-400 mb-6">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div>Locked In ({risk.tier_1_count})</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-full"></div>Unclear ({risk.tier_2_count})</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-rose-500 rounded-full"></div>Missing ({risk.tier_3_count})</div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded flex items-center gap-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full text-indigo-600 dark:text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">{risk.unverifiable_claim_count}</div>
                    <div className="text-[10px] uppercase font-mono text-slate-500">Unanchored Claims</div>
                  </div>
                </div>

                <button 
                  onClick={handleShowWorst}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white p-3 rounded font-mono text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Identify Vague Lines
                </button>
              </div>
              
              {showWorstLines && risk.worst_lines.length > 0 && (
                <div ref={worstLineRef} className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 animate-fade-in-up">
                  <h4 className="text-xs font-bold font-mono uppercase text-indigo-600 dark:text-indigo-400 mb-3 tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    Lowest Structural Anchors
                  </h4>
                  <div className="space-y-3">
                    {risk.worst_lines.map((line, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 border-l-4 border-slate-400 p-4 rounded-r-md">
                        <p className="font-serif text-lg italic text-slate-800 dark:text-slate-200 mb-2">
                          "{line.text}"
                        </p>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          <span className="font-bold">STRUCTURAL GAP:</span> {line.flaw}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {rhetoric && <RhetoricMeter data={rhetoric} />}

          {!isDocumentAnalysis && (
            <div className="mb-8 opacity-0 animate-fade-in-up-delay-1" style={{ animationFillMode: 'forwards' }}>
               <div className="flex justify-between text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                 <span>Structural Strength</span>
                 <span>{clearCount}/6 Checks Passed</span>
               </div>
               <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                 {[...Array(6)].map((_, i) => (
                   <div key={i} className={`flex-1 rounded-sm transition-all duration-1000 ease-out
                     ${i < clearCount ? 'bg-slate-800 dark:bg-slate-400' : 'bg-slate-200 dark:bg-slate-700'}`} 
                   />
                 ))}
               </div>
            </div>
          )}

          <div className="space-y-6 opacity-0 animate-fade-in-up-delay-2" style={{ animationFillMode: 'forwards' }}>
             <div>
               <h3 className="text-xs font-bold font-mono uppercase text-slate-400 mb-3 tracking-wider">
                 Summary of Commitments
               </h3>
               <div className="bg-emerald-50/50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 dark:border-emerald-700 p-5 rounded-r-lg">
                 <p className="font-sans text-base text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                   "{analysis.literal_translation}"
                 </p>
               </div>
             </div>
             
             {statement_analysis.debate_reason && (
               <div>
                 <h3 className="text-xs font-bold font-mono uppercase text-slate-400 mb-2 tracking-wider">Structural Ambiguity</h3>
                 <p className="text-sm font-sans text-slate-600 dark:text-slate-300 border-l-4 border-amber-300 dark:border-amber-600 pl-4 py-1 leading-relaxed">
                   {statement_analysis.debate_reason}
                 </p>
               </div>
             )}
          </div>
          
          <div className="mt-10 flex flex-col md:flex-row gap-3 opacity-0 animate-fade-in-up-delay-2" style={{ animationFillMode: 'forwards' }}>
             <button 
               onClick={() => setShowDeepDive(!showDeepDive)}
               className="flex-1 group bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white py-4 px-6 rounded-lg font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
             >
               {showDeepDive ? 'Hide Details' : 'See Details'}
               <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showDeepDive ? 'rotate-180' : ''}`} />
             </button>
             <button 
               onClick={handleShare}
               className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-4 px-6 rounded-lg font-mono text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
             >
               <span>Share</span>
             </button>
          </div>
        </div>
      </div>

      {showDeepDive && (
        <div className="animate-fade-in-up space-y-6">
          <div className="flex flex-wrap gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Mode:</span>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                   <button onClick={() => setStressTestMode(false)} className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all ${!stressTestMode ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>Standard</button>
                   <button onClick={() => setStressTestMode(true)} className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all ${stressTestMode ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500'}`}>Stress Test</button>
                </div>
             </div>
             <button onClick={() => setShowHighlight(!showHighlight)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase border transition-all ${showHighlight ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-700' : 'bg-white dark:bg-slate-800 text-slate-500'}`}>
                <span className={`w-2 h-2 rounded-full ${showHighlight ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                Highlight Signal
             </button>
          </div>

          {showHighlight && (
             <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in-up">
                <h4 className="text-xs font-bold font-mono uppercase text-slate-400 mb-4">Signal Detection</h4>
                <p className="font-serif text-xl leading-loose text-slate-300 dark:text-slate-600">
                  {statement_analysis.highlighted_text ? renderHighlightedText(statement_analysis.highlighted_text) : renderHighlightedText("**" + statement_analysis.original_text + "**")}
                </p>
             </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in-up">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h4 className="text-xs font-bold font-mono uppercase text-slate-500">Commitment Breakdown</h4>
              <span className="text-[10px] font-mono text-slate-400 italic">Structural elements of the main claim</span>
            </div>
            <div>
              {Object.keys(elements).map(key => (
                <ChecklistItem key={key} id={key} title={HUMAN_LABELS[key as keyof typeof HUMAN_LABELS]} element={elements[key as keyof typeof elements]} isStressTest={stressTestMode} />
              ))}
            </div>
          </div>

           {stressTestMode && (
             <div className="bg-slate-900 dark:bg-slate-800 text-white p-6 rounded-xl border border-slate-700 shadow-sm animate-fade-in-up flex gap-4 transition-colors">
                <div className="mt-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-widest mb-1 text-slate-400">Structural Projection</h4>
                  <p className="font-sans text-sm leading-relaxed text-slate-300">Without structural anchors, commitments have a high rate of decay over time.</p>
                </div>
             </div>
           )}

           {verifications.length > 0 && (
             <div className="animate-fade-in-up">
               <button onClick={() => setShowVerification(!showVerification)} className="w-full flex justify-between items-center p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30 rounded-lg group">
                 <span className="text-xs font-bold font-mono uppercase tracking-widest text-indigo-800 dark:text-indigo-400">Verifiable Requirements</span>
                 <ChevronDown className={`h-4 w-4 text-indigo-500 transition-transform ${showVerification ? 'rotate-180' : ''}`} />
               </button>
               {showVerification && (
                 <div className="mt-2 space-y-1 pl-4 border-l-2 border-indigo-200">
                   {verifications.map((item, idx) => (
                     <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                       <p className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1">{item.requirement}</p>
                       <p className="text-[10px] text-slate-400 font-mono uppercase">GAP: {item.gap}</p>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClarityCard;
