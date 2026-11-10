import React from 'react';
import { Sparkles, Terminal, User, Clock, ShieldCheck } from 'lucide-react';
import { Persona } from '../types';

interface NavbarProps {
  activePersona: Persona | null;
  onOpenPersonaModal: () => void;
  onOpenProxyModal: () => void;
  onOpenHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePersona,
  onOpenPersonaModal,
  onOpenProxyModal,
  onOpenHistory
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#0d1322]/90 backdrop-blur-md px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Bench.ai
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                Precision Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Prompt Optimization for AI Agents</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Active Persona Pill */}
          <button
            onClick={onOpenPersonaModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            title="Click to view or switch personas"
          >
            <User className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">Persona:</span>
            <span className="text-white font-semibold truncate max-w-[140px]">
              {activePersona ? activePersona.name : 'Loading...'}
            </span>
          </button>

          {/* Drop-in Proxy Indicator / Modal Button */}
          <button
            onClick={onOpenProxyModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 text-xs font-medium text-emerald-300 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Agent Proxy</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>History</span>
          </button>

        </div>
      </div>
    </header>
  );
};
