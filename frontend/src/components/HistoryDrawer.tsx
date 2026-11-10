import React from 'react';
import { X, Clock, ArrowRight, Target } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#111827] border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-[#0d1322]">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Prompt History</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No optimization history recorded yet.
              </div>
            ) : (
              history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    onSelectHistory(h);
                    onClose();
                  }}
                  className="bg-[#0b0f19] border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-xl cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {h.agent_target.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="flex items-center space-x-1">
                      <Target className="h-3 w-3 text-emerald-400" />
                      <span>{h.precision_score.toFixed(0)}%</span>
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-200 line-clamp-2">
                    {h.raw_prompt}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-850 text-[10px] text-slate-500">
                    <span>{new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <div className="flex items-center space-x-1 text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>Load</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
