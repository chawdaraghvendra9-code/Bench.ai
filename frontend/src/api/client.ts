import { Persona, OptimizationResult, HistoryItem, TargetPreset, SamplePrompt } from '../types';

const BASE_URL = '';

export async function fetchPersonas(): Promise<Persona[]> {
  const res = await fetch(`${BASE_URL}/api/personas`);
  if (!res.ok) throw new Error('Failed to fetch personas');
  return res.json();
}

export async function createPersona(persona: Partial<Persona>): Promise<Persona> {
  const res = await fetch(`${BASE_URL}/api/personas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(persona)
  });
  if (!res.ok) throw new Error('Failed to create persona');
  return res.json();
}

export async function updatePersona(id: string, updates: Partial<Persona>): Promise<Persona> {
  const res = await fetch(`${BASE_URL}/api/personas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update persona');
  return res.json();
}

export async function deletePersona(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/personas/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete persona');
}

export async function optimizePrompt(payload: {
  raw_prompt: string;
  persona_id?: string;
  agent_target: string;
  workspace_context?: string;
  enable_anti_goals?: boolean;
  enable_edge_cases?: boolean;
  enable_schemas?: boolean;
}): Promise<OptimizationResult> {
  const res = await fetch(`${BASE_URL}/api/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Optimization request failed' }));
    throw new Error(err.detail || 'Optimization failed');
  }
  return res.json();
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${BASE_URL}/api/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function rateHistoryItem(id: string, rating: number, feedback?: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/history/${id}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, feedback })
  });
  if (!res.ok) throw new Error('Failed to rate prompt');
}

export async function fetchPresets(): Promise<{ targets: TargetPreset[]; sample_prompts: SamplePrompt[] }> {
  const res = await fetch(`${BASE_URL}/api/presets`);
  if (!res.ok) throw new Error('Failed to fetch presets');
  return res.json();
}
