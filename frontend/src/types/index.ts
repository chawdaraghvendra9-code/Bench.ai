export interface Persona {
  id: string;
  name: string;
  role: string;
  seniority: string;
  tech_stack: string[];
  style_preferences: string[];
  anti_patterns: string[];
  communication_tone: string;
  custom_instructions?: string;
  is_default: boolean;
  created_at?: string;
}

export interface DiffItem {
  category: 'constraint' | 'edge_case' | 'anti_goal' | 'personalization' | 'schema' | 'intent';
  title: string;
  content: string;
  reason: string;
}

export interface PrecisionMetric {
  precision_score: number;
  personalization_score: number;
  ambiguity_reduction_pct: number;
  constraints_added: number;
  edge_cases_identified: number;
  anti_goals_specified: number;
}

export interface OptimizationResult {
  id: string;
  raw_prompt: string;
  enhanced_prompt: string;
  agent_target: string;
  persona_name: string;
  metrics: PrecisionMetric;
  diff_breakdown: DiffItem[];
  created_at: string;
}

export interface HistoryItem {
  id: string;
  raw_prompt: string;
  enhanced_prompt: string;
  agent_target: string;
  persona_name: string;
  precision_score: number;
  personalization_score: number;
  user_rating?: number | null;
  created_at: string;
}

export interface TargetPreset {
  id: string;
  name: string;
  description: string;
}

export interface SamplePrompt {
  title: string;
  category: string;
  prompt: string;
}
