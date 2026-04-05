
import React from 'react';
import { KlariPlainResponse } from '../types';

interface KlariPlainCardProps {
  data: KlariPlainResponse;
}

const KlariPlainCard: React.FC<KlariPlainCardProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">KlariPlain — Literal Restatement</span>
          <h2 className="text-xl font-bold font-mono text-slate-900 dark:text-white uppercase tracking-tight">Literal restatement based on explicit commitments</h2>
        </div>
        
        <div className="p-6 md:p-8 space-y-8">
          {/* Restated Commitments */}
          <div>
            <h3 className="text-xs font-bold font-mono uppercase text-indigo-600 dark:text-indigo-400 mb-4 tracking-wider">Restated Commitments:</h3>
            <ul className="space-y-4">
              {data.commitments.length > 0 ? (
                data.commitments.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border-l-4 border-indigo-500">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                    <p className="text-sm font-sans text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {item}
                    </p>
                  </li>
                ))
              ) : (
                <p className="text-sm font-sans text-slate-500 italic">The text contains no explicit, actionable commitments.</p>
              )}
            </ul>
          </div>

          {/* What Is Explicitly Stated */}
          <div>
            <h3 className="text-xs font-bold font-mono uppercase text-emerald-600 dark:text-emerald-400 mb-4 tracking-wider">What Is Explicitly Stated:</h3>
            <ul className="space-y-2">
              {data.explicitly_stated.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-mono text-slate-600 dark:text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* What Is Not Specified */}
          <div>
            <h3 className="text-xs font-bold font-mono uppercase text-amber-600 dark:text-amber-500 mb-4 tracking-wider">What Is Not Specified:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.not_specified.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-amber-50/30 dark:bg-amber-900/10 p-3 rounded border border-amber-100/50 dark:border-amber-900/30">
                  <div className="mt-1 h-1 w-1 rounded-full bg-amber-400 flex-shrink-0" />
                  <p className="text-[11px] font-mono text-amber-800 dark:text-amber-400 leading-tight uppercase">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-mono text-slate-400 text-center uppercase tracking-widest italic leading-relaxed">
            This is a literal restatement based only on what is explicitly stated.<br />
            No intent, interpretation, or missing details have been added.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KlariPlainCard;
