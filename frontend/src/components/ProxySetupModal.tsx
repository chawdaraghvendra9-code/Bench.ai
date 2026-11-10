import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ProxySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProxySetupModal: React.FC<ProxySetupModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const configs = [
    {
      tool: 'Cursor IDE',
      desc: 'Intercepts your Ctrl+K and Agent prompts to inject precision guardrails transparently.',
      code: `// In Cursor Settings -> Models -> OpenAI API Key:
// 1. Set 'Override OpenAI Base URL' to:
http://localhost:8000/v1

// 2. Set API Key to any dummy string (e.g. 'bench-proxy') if using mock mode,
//    or configure UPSTREAM_LLM_URL in Bench.ai .env.`
    },
    {
      tool: 'Cline / Claude Dev (VS Code)',
      desc: 'Seamlessly optimize autonomous coding tasks without modifying extension source.',
      code: `// Settings -> API Provider:
API Provider: OpenAI Compatible
Base URL: http://localhost:8000/v1
Model ID: bench-optimizer-v1`
    },
    {
      tool: 'Python OpenAI SDK / LangChain / CrewAI',
      desc: 'Integrate into any custom agent workflow in two lines of code.',
      code: `from openai import OpenAI

# Point to Bench.ai local precision proxy
client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="bench-dummy-key"
)

# Prompts are automatically upgraded with your active persona!
response = client.chat.completions.create(
    model="bench-optimizer-v1",
    messages=[{"role": "user", "content": "add jwt authentication"}]
)`
    },
    {
      tool: 'cURL Verification',
      desc: 'Test the proxy endpoint directly from terminal.',
      code: `curl -X POST http://localhost:8000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "bench-optimizer-v1",
    "messages": [{"role": "user", "content": "fix memory leak in socket connection"}]
  }'`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-[#0d1322]">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Drop-in AI Agent Proxy</h2>
              <p className="text-xs text-slate-400">OpenAI-compatible reverse proxy running at <code className="text-emerald-300">http://localhost:8000/v1</code></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4 flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">Zero Code Changes Required in External Agents</p>
              <p className="text-slate-400">
                Any tool supporting an OpenAI endpoint can point to Bench.ai. The proxy automatically intercepts the user prompt, applies your active persona, injects precision constraints, and provides the upgraded instructions.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {configs.map((c, idx) => (
              <div key={idx} className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/60 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white">{c.tool}</span>
                    <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">{c.desc}</span>
                  </div>
                  <button
                    onClick={() => copyCode(c.code, idx)}
                    className="flex items-center space-x-1 text-[11px] text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20"
                  >
                    {copiedIndex === idx ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3.5 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre">
                  {c.code}
                </pre>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
