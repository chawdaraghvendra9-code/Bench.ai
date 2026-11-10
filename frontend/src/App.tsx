import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PromptPlayground } from './components/PromptPlayground';
import { DiffViewer } from './components/DiffViewer';
import { OptimizationScorecard } from './components/OptimizationScorecard';
import { PersonaModal } from './components/PersonaModal';
import { ProxySetupModal } from './components/ProxySetupModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Persona, OptimizationResult, HistoryItem, TargetPreset, SamplePrompt } from './types';
import { fetchPersonas, fetchPresets, fetchHistory, optimizePrompt } from './api/client';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Code2, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersonaId, setActivePersonaId] = useState<string>('');
  const [targets, setTargets] = useState<TargetPreset[]>([]);
  const [samplePrompts, setSamplePrompts] = useState<SamplePrompt[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Playground state
  const [rawPrompt, setRawPrompt] = useState<string>('add jwt authentication and rate limiting to my endpoints');
  const [agentTarget, setAgentTarget] = useState<string>('coding_agent');
  const [workspaceContext, setWorkspaceContext] = useState<string>('Repo: Bench.ai | Backend: FastAPI | Auth: OAuth2 Bearer');
  const [antiGoals, setAntiGoals] = useState<boolean>(true);
  const [edgeCases, setEdgeCases] = useState<boolean>(true);
  const [schemas, setSchemas] = useState<boolean>(true);

  // Result state
  const [currentResult, setCurrentResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState<boolean>(false);
  const [isProxyModalOpen, setIsProxyModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Initial load
  const loadInitialData = async () => {
    try {
      const [personasData, presetsData, historyData] = await Promise.all([
        fetchPersonas(),
        fetchPresets(),
        fetchHistory()
      ]);
      setPersonas(personasData);
      const defaultP = personasData.find(p => p.is_default) || personasData[0];
      if (defaultP && !activePersonaId) {
        setActivePersonaId(defaultP.id);
      }
      setTargets(presetsData.targets);
      setSamplePrompts(presetsData.sample_prompts);
      setHistory(historyData);
    } catch (err: any) {
      console.error("Initialization error:", err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const activePersona = personas.find(p => p.id === activePersonaId) || null;

  // Handle Optimize
  const handleOptimize = async () => {
    if (!rawPrompt.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await optimizePrompt({
        raw_prompt: rawPrompt,
        persona_id: activePersonaId || undefined,
        agent_target: agentTarget,
        workspace_context: workspaceContext || undefined,
        enable_anti_goals: antiGoals,
        enable_edge_cases: edgeCases,
        enable_schemas: schemas
      });
      setCurrentResult(result);
      // Refresh history
      const updatedHistory = await fetchHistory();
      setHistory(updatedHistory);
    } catch (err: any) {
      setError(err.message || 'Optimization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setRawPrompt(item.raw_prompt);
    setAgentTarget(item.agent_target);
    // Auto-run or simulate result
    setCurrentResult({
      id: item.id,
      raw_prompt: item.raw_prompt,
      enhanced_prompt: item.enhanced_prompt,
      agent_target: item.agent_target,
      persona_name: item.persona_name || 'Standard',
      metrics: {
        precision_score: item.precision_score,
        personalization_score: item.personalization_score,
        ambiguity_reduction_pct: 75,
        constraints_added: 4,
        edge_cases_identified: 3,
        anti_goals_specified: 4
      },
      diff_breakdown: [],
      created_at: item.created_at
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        activePersona={activePersona}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
        onOpenProxyModal={() => setIsProxyModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Banner / Value Prop Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800/60 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>Precision Prompt Studio</span>
              <span className="text-emerald-400 font-mono text-sm font-normal">v1.0</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Transforms vague human requests into hyper-personalized, deterministic instructions for AI agents.
            </p>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <span>Persona Memory: Synced</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
              <span>Local Proxy: 8000/v1</span>
            </span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs p-3.5 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">&times;</button>
          </div>
        )}

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Input Playground (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <PromptPlayground
              rawPrompt={rawPrompt}
              setRawPrompt={setRawPrompt}
              selectedPersonaId={activePersonaId}
              setSelectedPersonaId={setActivePersonaId}
              personas={personas}
              agentTarget={agentTarget}
              setAgentTarget={setAgentTarget}
              targets={targets}
              samplePrompts={samplePrompts}
              workspaceContext={workspaceContext}
              setWorkspaceContext={setWorkspaceContext}
              antiGoals={antiGoals}
              setAntiGoals={setAntiGoals}
              edgeCases={edgeCases}
              setEdgeCases={setEdgeCases}
              schemas={schemas}
              setSchemas={setSchemas}
              onOptimize={handleOptimize}
              isLoading={isLoading}
            />

            {/* Quick Agent Compatibility Guide */}
            <div className="bg-[#111827]/60 border border-slate-800/60 rounded-xl p-4 text-xs text-slate-400 space-y-2">
              <div className="font-bold text-white flex items-center space-x-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <span>Compatible With Your Favorite Agent Tools</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Output prompts are formatted for <strong>Cursor Composer</strong>, <strong>Claude Code</strong>, <strong>Aider</strong>, <strong>LangGraph</strong>, and <strong>CrewAI</strong>. Or point your tool directly to <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">http://localhost:8000/v1</code>.
              </p>
            </div>
          </div>

          {/* Right Column: Scorecard & Output Viewer (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {currentResult ? (
              <>
                <OptimizationScorecard metrics={currentResult.metrics} />
                <DiffViewer result={currentResult} />
              </>
            ) : (
              /* Empty / Getting Started State */
              <div className="bg-[#111827] border border-dashed border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px]">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                  <Sparkles className="h-8 w-8 stroke-[1.75]" />
                </div>
                
                <div className="max-w-md space-y-1.5">
                  <h3 className="text-base font-bold text-white">Ready for Precision Optimization</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Type a prompt on the left or select a sample, then click <strong className="text-emerald-400 font-semibold">Auto-Improve Prompt</strong> to witness personal tech stack injection, defensive boundary hardening, and agent formatting.
                  </p>
                </div>

                <button
                  onClick={handleOptimize}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                >
                  <span>Run Sample Optimization</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Modals & Drawers */}
      <PersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        personas={personas}
        onRefresh={loadInitialData}
        activePersonaId={activePersonaId}
        onSelectPersona={(id) => setActivePersonaId(id)}
      />

      <ProxySetupModal
        isOpen={isProxyModalOpen}
        onClose={() => setIsProxyModalOpen(false)}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={handleSelectHistoryItem}
      />

    </div>
  );
};
