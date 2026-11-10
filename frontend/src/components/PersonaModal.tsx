import React, { useState } from 'react';
import { X, Plus, Trash2, Check, UserPlus, Sparkles, ShieldAlert } from 'lucide-react';
import { Persona } from '../types';
import { createPersona, updatePersona, deletePersona } from '../api/client';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  personas: Persona[];
  onRefresh: () => void;
  activePersonaId: string;
  onSelectPersona: (id: string) => void;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  personas,
  onRefresh,
  activePersonaId,
  onSelectPersona
}) => {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(personas[0] || null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [seniority, setSeniority] = useState('Senior');
  const [techStackInput, setTechStackInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [styleInput, setStyleInput] = useState('');
  const [stylePreferences, setStylePreferences] = useState<string[]>([]);
  const [antiPatternInput, setAntiPatternInput] = useState('');
  const [antiPatterns, setAntiPatterns] = useState<string[]>([]);
  const [tone, setTone] = useState('Concise & Technical');

  if (!isOpen) return null;

  const handleSelectToEdit = (p: Persona) => {
    setSelectedPersona(p);
    setIsCreating(false);
    setName(p.name);
    setRole(p.role);
    setSeniority(p.seniority);
    setTechStack(p.tech_stack);
    setStylePreferences(p.style_preferences);
    setAntiPatterns(p.anti_patterns);
    setTone(p.communication_tone);
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedPersona(null);
    setName('Custom Persona');
    setRole('Software Engineer');
    setSeniority('Senior');
    setTechStack(['TypeScript', 'Node.js', 'PostgreSQL']);
    setStylePreferences(['Strict type safety', 'Write unit tests']);
    setAntiPatterns(['No monolithic functions']);
    setTone('Concise & Production-Ready');
  };

  const handleAddTech = () => {
    if (techStackInput.trim() && !techStack.includes(techStackInput.trim())) {
      setTechStack([...techStack, techStackInput.trim()]);
      setTechStackInput('');
    }
  };

  const handleAddStyle = () => {
    if (styleInput.trim()) {
      setStylePreferences([...stylePreferences, styleInput.trim()]);
      setStyleInput('');
    }
  };

  const handleAddAntiPattern = () => {
    if (antiPatternInput.trim()) {
      setAntiPatterns([...antiPatterns, antiPatternInput.trim()]);
      setAntiPatternInput('');
    }
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        const created = await createPersona({
          name,
          role,
          seniority,
          tech_stack: techStack,
          style_preferences: stylePreferences,
          anti_patterns: antiPatterns,
          communication_tone: tone
        });
        await onRefresh();
        onSelectPersona(created.id);
        setIsCreating(false);
        setSelectedPersona(created);
      } else if (selectedPersona) {
        const updated = await updatePersona(selectedPersona.id, {
          name,
          role,
          seniority,
          tech_stack: techStack,
          style_preferences: stylePreferences,
          anti_patterns: antiPatterns,
          communication_tone: tone
        });
        await onRefresh();
        setSelectedPersona(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this persona?')) {
      await deletePersona(id);
      await onRefresh();
      if (selectedPersona?.id === id) {
        setSelectedPersona(personas.find(p => p.id !== id) || null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-[#0d1322]">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Persona & Personalization Studio</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
          
          {/* Left: Persona List */}
          <div className="p-4 space-y-2 overflow-y-auto max-h-[70vh]">
            <button
              onClick={handleStartCreate}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors mb-3"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create New Persona</span>
            </button>

            {personas.map((p) => {
              const isSelected = selectedPersona?.id === p.id;
              const isActive = activePersonaId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectToEdit(p)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/60 shadow-md'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{p.name}</span>
                    {isActive && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">Active</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">{p.role}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.tech_stack.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                    {p.tech_stack.length > 3 && (
                      <span className="text-[9px] text-slate-500">+{p.tech_stack.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Persona Details & Editor */}
          <div className="p-6 md:col-span-2 overflow-y-auto max-h-[70vh] space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {isCreating ? 'Create New Persona' : `Edit: ${selectedPersona?.name}`}
              </h3>
              {selectedPersona && !isCreating && (
                <button
                  onClick={() => onSelectPersona(selectedPersona.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-colors ${
                    activePersonaId === selectedPersona.id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {activePersonaId === selectedPersona.id ? 'Currently Active' : 'Set as Active'}
                </button>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400">Persona Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400">Role Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400">Seniority</label>
                <select
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Staff/Principal">Staff / Principal</option>
                  <option value="Founder/CTO">Founder / CTO</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400">Communication Tone</label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Preferred Tech Stack</label>
              <div className="flex space-x-2 mt-1">
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                  placeholder="e.g. FastAPI, Tailwind, PostgreSQL"
                  className="flex-1 bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleAddTech}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {techStack.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs"
                  >
                    <span>{t}</span>
                    <button
                      onClick={() => setTechStack(techStack.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-white"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Style Rules */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Coding Style & Quality Standards</label>
              <div className="flex space-x-2 mt-1">
                <input
                  type="text"
                  value={styleInput}
                  onChange={(e) => setStyleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStyle())}
                  placeholder="e.g. Type hints everywhere, zero any types"
                  className="flex-1 bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleAddStyle}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-1 mt-2">
                {stylePreferences.map((s, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs text-slate-300 bg-[#0b0f19] px-2.5 py-1 rounded-lg border border-slate-800">
                    <span>• {s}</span>
                    <button onClick={() => setStylePreferences(stylePreferences.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Anti-Patterns */}
            <div>
              <label className="text-[11px] font-semibold text-rose-400">Personal Anti-Patterns (What to Avoid)</label>
              <div className="flex space-x-2 mt-1">
                <input
                  type="text"
                  value={antiPatternInput}
                  onChange={(e) => setAntiPatternInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAntiPattern())}
                  placeholder="e.g. Do not use inline styles, no eval()"
                  className="flex-1 bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={handleAddAntiPattern}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-1 mt-2">
                {antiPatterns.map((a, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs text-rose-300/90 bg-rose-950/20 px-2.5 py-1 rounded-lg border border-rose-900/30">
                    <span>✕ {a}</span>
                    <button onClick={() => setAntiPatterns(antiPatterns.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {selectedPersona && !isCreating && !selectedPersona.is_default ? (
                <button
                  onClick={() => handleDelete(selectedPersona.id)}
                  className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Persona</span>
                </button>
              ) : <div />}

              <button
                onClick={handleSave}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Check className="h-4 w-4" />
                <span>Save Persona</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
