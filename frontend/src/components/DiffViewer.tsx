import React, { useState } from 'react';
import { Copy, Check, Download, ThumbsUp, ThumbsDown, Layers, FileText, HelpCircle, CheckCircle } from 'lucide-react';
import { OptimizationResult, DiffItem } from '../types';
import { rateHistoryItem } from '../api/client';

interface DiffViewerProps {
  result: OptimizationResult;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [rated, setRated] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'prompt' | 'breakdown' | 'comparison'>('prompt');

  const handleCopy = () => {
    navigator.clipboard.writeText(result.enhanced_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result.enhanced_prompt], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bench-prompt-${result.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRate = async (rating: number) => {
    setRated(rating);
    try {
      await rateHistoryItem(result.id, rating);
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryBadge = (cat: DiffItem['category']) => {
    switch (cat) {
      case 'constraint':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Constraint</span>;
      case 'edge_case':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Edge Case</span>;
      case 'anti_goal':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">Anti-Goal</span>;
      case 'personalization':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">Persona Rule</span>;
      case 'schema':
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Schema / Contract</span>;
      default:
        return <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">Intent</span>;
    }
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
      
      {/* Top Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 px-5 py-3 bg-[#0d1322]">
        
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'prompt'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Agent-Ready Prompt</span>
          </button>

          <button
            onClick={() => setActiveTab('breakdown')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'breakdown'
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Precision Rationale ({result.diff_breakdown.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'comparison'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          
          {/* Rating */}
          <div className="flex items-center space-x-1 mr-2 border-r border-slate-800 pr-3">
            <button
              onClick={() => handleRate(1)}
              className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                rated === 1 ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Thumbs Up: Accurate Precision"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleRate(-1)}
              className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                rated === -1 ? 'text-rose-400 bg-rose-500/10' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Thumbs Down: Too Verbose or Misaligned"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Download Markdown"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy for Agent</span>
              </>
            )}
          </button>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 overflow-y-auto max-h-[580px]">
        
        {/* Tab 1: Enhanced Agent-Ready Prompt */}
        {activeTab === 'prompt' && (
          <div className="relative">
            <pre className="font-mono text-xs sm:text-sm text-slate-200 leading-relaxed bg-[#0b0f19] p-4 rounded-xl border border-slate-800/80 whitespace-pre-wrap select-text">
              {result.enhanced_prompt}
            </pre>
          </div>
        )}

        {/* Tab 2: Precision Rationale Breakdown */}
        {activeTab === 'breakdown' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              Every directive injected by Bench.ai is grounded in precision engineering and user personalization rules:
            </div>
            {result.diff_breakdown.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    {getCategoryBadge(item.category)}
                    <span className="text-xs font-bold text-slate-200">{item.title}</span>
                  </div>
                </div>
                <div className="text-xs font-mono text-emerald-300/90 bg-emerald-950/20 border border-emerald-900/30 p-2 rounded-lg mb-2">
                  {item.content}
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span>{item.reason}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Side-by-Side Comparison */}
        {activeTab === 'comparison' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Original User Prompt</span>
                <span className="text-[10px] text-slate-500 lowercase">(underspecified)</span>
              </div>
              <div className="bg-[#0b0f19] border border-rose-950/40 rounded-xl p-3.5 text-xs text-slate-300 font-mono flex-1 whitespace-pre-wrap">
                {result.raw_prompt}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Precision Agent Prompt</span>
                <span className="text-[10px] text-emerald-500/80 uppercase">({result.metrics.precision_score}% deterministic)</span>
              </div>
              <div className="bg-[#0b0f19] border border-emerald-950/40 rounded-xl p-3.5 text-xs text-slate-300 font-mono flex-1 whitespace-pre-wrap overflow-y-auto max-h-[460px]">
                {result.enhanced_prompt}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
