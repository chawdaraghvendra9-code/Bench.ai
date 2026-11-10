from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

class Persona(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str = "Senior Software Engineer"
    seniority: str = "Senior"
    tech_stack: List[str] = Field(default_factory=list)
    style_preferences: List[str] = Field(default_factory=list)
    anti_patterns: List[str] = Field(default_factory=list)
    communication_tone: str = "Concise & Technical"
    custom_instructions: Optional[str] = ""
    is_default: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PersonaUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    seniority: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    style_preferences: Optional[List[str]] = None
    anti_patterns: Optional[List[str]] = None
    communication_tone: Optional[str] = None
    custom_instructions: Optional[str] = None
    is_default: Optional[bool] = None

class OptimizeRequest(BaseModel):
    raw_prompt: str
    persona_id: Optional[str] = None
    agent_target: str = "coding_agent"  # coding_agent, workflow_agent, reasoning_model, general_chat
    workspace_context: Optional[str] = None
    enable_anti_goals: bool = True
    enable_edge_cases: bool = True
    enable_schemas: bool = True

class DiffItem(BaseModel):
    category: str  # constraint, edge_case, anti_goal, personalization, schema, intent
    title: str
    content: str
    reason: str

class PrecisionMetric(BaseModel):
    precision_score: float = 0.0
    personalization_score: float = 0.0
    ambiguity_reduction_pct: float = 0.0
    constraints_added: int = 0
    edge_cases_identified: int = 0
    anti_goals_specified: int = 0

class OptimizationResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    raw_prompt: str
    enhanced_prompt: str
    agent_target: str
    persona_name: Optional[str] = None
    metrics: PrecisionMetric
    diff_breakdown: List[DiffItem] = Field(default_factory=list)
    system_prompt_directive: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class HistoryItem(BaseModel):
    id: str
    raw_prompt: str
    enhanced_prompt: str
    agent_target: str
    persona_name: Optional[str]
    precision_score: float
    personalization_score: float
    user_rating: Optional[int] = None  # 1 (thumbs up), -1 (thumbs down), None
    created_at: str

class RatingRequest(BaseModel):
    rating: int  # 1 or -1
    feedback: Optional[str] = None
