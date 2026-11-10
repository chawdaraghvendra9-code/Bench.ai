import React, { useState } from 'react';
import { Sparkles, Code2, Bot, BrainCircuit, MessageSquare, ChevronDown, ChevronUp, FolderGit2, Shield, Settings2 } from 'lucide-react';
import { Persona, TargetPreset, SamplePrompt } from '../types';

interface PromptPlaygroundProps {
  rawPrompt: string;
  setRawPrompt: (prompt: string) => void;
  selectedPersonaId: string;
  setSelectedPersonaId: (id: string) => void;
  personas: Persona[];
  agentTarget: string;
  setAgentTarget: (target: string) => void;
  targets: TargetPreset[];
  samplePrompts: SamplePrompt[];
  workspaceContext: string;
  setWorkspaceContext: (ctx: string) => void;
  antiGoals: boolean;
  setAntiGoals: (v: boolean) => void;
  edgeCases: boolean;
  setEdgeCases: (v: boolean) => void;
  schemas: boolean;
  setSchemas: (v: boolean) => void;
  onOptimize: () => void;
  isLoading: boolean;
}

export const PromptPlayground: React.FC<PromptPlaygroundProps> = ({
  rawPrompt,
  setRawPrompt,
  selectedPersonaId,
  setSelectedPersonaId,
  personas,
  agentTarget,
  setAgentTarget,
  targets,
  samplePrompts,
  workspaceContext,
  setWorkspaceContext,
  antiGoals,
  setAntiGoals,
  edgeCases,
  setEdgeCases,
  schemas,
  setSchemas,
  onOptimize,
  isLoading
}) => {
  const [showWorkspace, setShowWorkspace] = useState(false);

  const getTargetIcon = (id: string) => {
    switch (id) {
      case 'coding_agent':
        return <Code2 className="h-4 w-4" />;
      case 'workflow_agent':
        return <Bot className="h-4 w-4" />;
      case 'reasoning_model':
        return <BrainCircuit className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onOptimize();
    }
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col space-y-4">
      
      {/* Header & Target Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <span>Target AI Agent Architecture</span>
          </label>
          <span className="text-[11px] text-slate-500">Auto-tailored prompt structure</span>
        </div>

        {/* Target Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {targets.map((t) => {
            const isSelected = agentTarget === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setAgentTarget(t.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border text-left ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className={`p-1 rounded-lg ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {getTargetIcon(t.id)}
                </div>
                <div className="truncate">
                  <div className="truncate">{t.name.split('(')[0].trim()}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Raw Prompt Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Raw Human Prompt (Underspecified)
          </label>
          <span className="text-[11px] text-slate-500">
            Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[10px] text-slate-300">Ctrl</kbd> + <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[10px] text-slate-300">Enter</kbd> to optimize
          </span>
        </div>

        <div className="relative">
          <textarea
            value={rawPrompt}
            onChange={(e) => setRawPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Add JWT authentication and rate limiting to my endpoints, or fix the slow SQL queries..."
            rows={5}
            className="w-full bg-[#0b0f19] border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all resize-none font-mono"
          />
        </div>

        {/* Quick Sample Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto py-1 text-xs text-slate-400">
          <span className="text-[11px] text-slate-500 whitespace-nowrap">Try example:</span>
          {samplePrompts.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => setRawPrompt(sample.prompt)}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-emerald-300 transition-colors"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Personalization & Workspace Toggle */}
      <div className="border-t border-slate-800/80 pt-3 space-y-3">
        
        <div className="flex items-center justify-between">
          
          {/* Persona Picker */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Apply Persona:</span>
            <select
              value={selectedPersonaId}
              onChange={(e) => setSelectedPersonaId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Workspace Context */}
          <button
            onClick={() => setShowWorkspace(!showWorkspace)}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <FolderGit2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Workspace Context</span>
            {showWorkspace ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Workspace Input (collapsible) */}
        {showWorkspace && (
          <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-800 space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">
              Active Project & Directory Context (Optional)
            </label>
            <input
              type="text"
              value={workspaceContext}
              onChange={(e) => setWorkspaceContext(e.target.value)}
              placeholder="e.g. Repo: Bench.ai, Stack: Python 3.12 / FastAPI / React 19, Auth: Bearer JWT"
              className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {/* Precision Guardrails Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-300">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={antiGoals}
                onChange={(e) => setAntiGoals(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-[11px] text-slate-400">Anti-Goals</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={edgeCases}
                onChange={(e) => setEdgeCases(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-[11px] text-slate-400">Edge Cases</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={schemas}
                onChange={(e) => setSchemas(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-[11px] text-slate-400">Output Schemas</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={onOptimize}
            disabled={isLoading || !rawPrompt.trim()}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
              isLoading || !rawPrompt.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 hover:opacity-95 shadow-emerald-500/25 active:scale-95'
            }`}
          >
            <Sparkles className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Synthesizing...' : 'Auto-Improve Prompt'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
