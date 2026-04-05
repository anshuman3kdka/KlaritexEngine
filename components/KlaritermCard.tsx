
import React, { useState } from 'react';
import { KlaritermResponse, DecoderClause } from '../types';

interface KlaritermCardProps {
  data: KlaritermResponse;
}

const DIMENSION_CLARIFICATIONS: Record<string, string> = {
  "Asymmetry (A)": "Who has the power and who has the job.",
  "Unilateral (U)": "Decisions made by one side without asking the other.",
  "Rights (R)": "Changes to what you own or what you can do.",
  "Scope (S)": "How far it reaches and how long it lasts.",
  "Latent (L)": "Effects that only appear later, not immediately."
};

const ImpactBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-mono uppercase text-slate-400">
      <span>{label}</span>
      <span>{value}/{max}</span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div 
        style={{ width: `${(value / max) * 100}%` }} 
        className={`h-full ${color} transition-all duration-1000`}
      />
    </div>
    <p className="text-[9px] text-slate-500 dark:text-slate-500 font-sans italic">
      {DIMENSION_CLARIFICATIONS[label]}
    </p>
  </div>
);

const ClauseItem: React.FC<{ clause: DecoderClause }> = ({ clause }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-start gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
      >
        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${clause.scores.total_cis >= 6 ? 'bg-rose-500 animate-pulse' : clause.scores.total_cis >= 4 ? 'bg-amber-500' : 'bg-slate-300'}`} />
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h4 className={`text-sm font-medium text-slate-900 dark:text-slate-200 transition-all ${isOpen ? '' : 'line-clamp-1'}`}>
              {clause.description}
            </h4>
            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-sm flex-shrink-0 ml-2 ${clause.impact_classification === 'High' ? 'bg-rose-100 text-rose-700' : clause.impact_classification === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              {clause.impact_classification} Impact
            </span>
          </div>
          {!isOpen && (
            <p className="text-xs text-slate-500 font-serif italic line-clamp-1">"{clause.excerpt}"</p>
          )}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 mt-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 pl-10 space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-inner">
            <h5 className="text-[10px] font-mono uppercase text-slate-400 mb-2">Original Clause Text</h5>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif italic mb-6">
              "{clause.excerpt}"
            </p>
            
            <h5 className="text-[10px] font-mono uppercase text-slate-400 mb-3 pt-4 border-t border-slate-200 dark:border-slate-700">Impact Dimensions</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <ImpactBar label="Asymmetry (A)" value={clause.scores.asymmetry} max={2} color="bg-indigo-400" />
              <ImpactBar label="Unilateral (U)" value={clause.scores.unilateral} max={2} color="bg-indigo-400" />
              <ImpactBar label="Rights (R)" value={clause.scores.rights} max={2} color="bg-indigo-400" />
              <ImpactBar label="Scope (S)" value={clause.scores.scope} max={2} color="bg-indigo-400" />
              <ImpactBar label="Latent (L)" value={clause.scores.latent} max={2} color="bg-indigo-400" />
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 md:col-span-2">
                <span className="text-xs font-bold font-mono uppercase text-slate-500">Total Clause Impact Score (CIS)</span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{clause.scores.total_cis}/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KlaritermCard: React.FC<KlaritermCardProps> = ({ data }) => {
  if (!data || !data.metrics) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
        <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">No Decoder Data Available</p>
      </div>
    );
  }

  // Handle both old 0-100 and new 0-1 formats for HICR
  const hicrPercent = data.metrics.hicr <= 1 ? (data.metrics.hicr * 100).toFixed(0) : data.metrics.hicr.toFixed(0);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">Klariterm Decoder</span>
          <h2 className="text-xl font-bold font-mono text-slate-900 dark:text-white uppercase">Concentration Overview</h2>
        </div>
        <div className="p-6 md:p-8">
          <p className="text-lg text-slate-800 dark:text-slate-200 font-sans leading-relaxed mb-8">
            {data.overview}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="block text-[10px] font-mono uppercase text-slate-400 mb-1">HICR Ratio</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{hicrPercent}%</div>
              <p className="text-[9px] text-slate-500 mt-1 italic leading-tight">Percentage of analyzed clauses identified as High Impact.</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Skew Index (ISI)</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{data.metrics.isi.toFixed(1)}</div>
              <p className="text-[9px] text-slate-500 mt-1 italic leading-tight">Whether impact is in one spot or spread out.</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Exposed Domains</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.metrics.exposure_domains?.map(d => (
                  <span key={d} className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[9px] font-mono uppercase font-bold rounded">
                    {d}
                  </span>
                ))}
              </div>
              <p className="text-[9px] text-slate-500 mt-2 italic leading-tight">Specific areas of consequence found.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-rose-50/50 dark:bg-rose-900/10 px-5 py-3 border-b border-rose-100 dark:border-rose-900/30 flex justify-between items-center">
          <h3 className="text-xs font-bold font-mono uppercase text-rose-700 dark:text-rose-400">Clauses Worth Closer Attention</h3>
          <span className="text-[10px] font-mono text-rose-400 uppercase">{data.attention_clauses?.length || 0} Flagged</span>
        </div>
        <div>
          {data.attention_clauses?.map((clause, idx) => (
            <ClauseItem key={idx} clause={clause} />
          ))}
        </div>
      </div>

      {data.structural_exposure && data.structural_exposure.length > 0 && (
        <div className="bg-slate-900 dark:bg-slate-800 text-white p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 mb-4">Structural Exposure Summary</h3>
          <ul className="space-y-3">
            {data.structural_exposure.map((obs, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <div className="mt-1.5 h-1 w-1 rounded-full bg-indigo-400 flex-shrink-0" />
                <span className="text-slate-200">{obs}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default KlaritermCard;
