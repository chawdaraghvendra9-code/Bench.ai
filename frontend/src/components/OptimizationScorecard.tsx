import React from 'react';
import { Target, Zap, ShieldAlert, Sparkles, CheckCircle2, TrendingDown } from 'lucide-react';
import { PrecisionMetric } from '../types';

interface OptimizationScorecardProps {
  metrics: PrecisionMetric;
}

export const OptimizationScorecard: React.FC<OptimizationScorecardProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      
      {/* Precision Score */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
          <span className="flex items-center space-x-1.5">
            <Target className="h-4 w-4 text-emerald-400" />
            <span>Precision Score</span>
          </span>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            High Determinism
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-white tracking-tight">
            {metrics.precision_score.toFixed(0)}%
          </span>
          <span className="text-xs text-emerald-400 font-medium">Optimal</span>
        </div>
        <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, metrics.precision_score)}%` }}
          />
        </div>
      </div>

      {/* Personalization Alignment */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
          <span className="flex items-center space-x-1.5">
            <Sparkles className="h-4 w-4 text-sky-400" />
            <span>Personalization</span>
          </span>
          <span className="text-[11px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
            Style Synced
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-white tracking-tight">
            {metrics.personalization_score.toFixed(0)}%
          </span>
          <span className="text-xs text-sky-400 font-medium">Context Injected</span>
        </div>
        <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-500 to-blue-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, metrics.personalization_score)}%` }}
          />
        </div>
      </div>

      {/* Ambiguity Reduction */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
          <span className="flex items-center space-x-1.5">
            <TrendingDown className="h-4 w-4 text-purple-400" />
            <span>Ambiguity Removed</span>
          </span>
          <span className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
            Cleaned
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-white tracking-tight">
            -{metrics.ambiguity_reduction_pct.toFixed(0)}%
          </span>
          <span className="text-xs text-purple-400 font-medium">Vagueness Cut</span>
        </div>
        <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, metrics.ambiguity_reduction_pct)}%` }}
          />
        </div>
      </div>

      {/* Injected Guardrails Counter */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center space-x-1.5">
          <ShieldAlert className="h-4 w-4 text-amber-400" />
          <span>Active Guardrails</span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-center mt-1">
          <div className="bg-slate-900/50 p-1.5 rounded-lg border border-slate-700/50">
            <div className="text-xs font-bold text-emerald-400">+{metrics.constraints_added}</div>
            <div className="text-[9px] text-slate-400 uppercase tracking-tighter">Constraints</div>
          </div>
          <div className="bg-slate-900/50 p-1.5 rounded-lg border border-slate-700/50">
            <div className="text-xs font-bold text-amber-400">+{metrics.edge_cases_identified}</div>
            <div className="text-[9px] text-slate-400 uppercase tracking-tighter">Edges</div>
          </div>
          <div className="bg-slate-900/50 p-1.5 rounded-lg border border-slate-700/50">
            <div className="text-xs font-bold text-rose-400">+{metrics.anti_goals_specified}</div>
            <div className="text-[9px] text-slate-400 uppercase tracking-tighter">Anti-Goals</div>
          </div>
        </div>
      </div>

    </div>
  );
};
