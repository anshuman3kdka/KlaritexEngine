
import React from 'react';
import { AnalysisHistoryItem, KlaritexLevel } from '../types';

interface AccountabilityLedgerProps {
  history: AnalysisHistoryItem[];
  onSelect: (item: AnalysisHistoryItem) => void;
  onClear: () => void;
}

const AccountabilityLedger: React.FC<AccountabilityLedgerProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-8 transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Past Klaritex Results ({history.length})
        </h3>
        <button onClick={onClear} className="text-[10px] font-mono text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 uppercase transition-colors">
          Clear History
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="py-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-normal w-24">Analysis Mode</th>
              <th className="py-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-normal">Statement Excerpt</th>
              <th className="py-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-normal w-24">Date</th>
              <th className="py-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-normal w-16">Action</th>
            </tr>
          </thead>
          <tbody>
            {history.slice().reverse().map((item) => (
              <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <td className="py-3">
                  {item.pipeline === 'term' ? (
                    <span className="inline-block px-2 py-1 rounded text-[10px] font-bold font-mono bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 uppercase">
                      Klariterm
                    </span>
                  ) : item.score ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">Klarilens</span>
                      <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold font-mono text-center
                        ${item.score.tier === KlaritexLevel.LEVEL_1 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 
                          item.score.tier === KlaritexLevel.LEVEL_2 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 
                          'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'}`}>
                        {item.score.finalAmbiguityScore.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Klarilens</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  <p className="font-sans text-xs text-slate-600 dark:text-slate-300 truncate max-w-md">
                    {item.text}
                  </p>
                </td>
                <td className="py-3 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {new Date(item.timestamp).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <button 
                    onClick={() => onSelect(item)}
                    className="text-[10px] font-bold font-mono uppercase text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white border border-slate-200 dark:border-slate-700 px-2 py-1 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountabilityLedger;
