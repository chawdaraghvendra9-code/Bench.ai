import sqlite3
import json
import os
from typing import List, Optional, Dict, Any
from app.models.schemas import Persona, OptimizationResult, HistoryItem

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "bench_data.db")

class MemoryStore:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()
        self._seed_default_personas()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS personas (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                seniority TEXT NOT NULL,
                tech_stack TEXT NOT NULL,
                style_preferences TEXT NOT NULL,
                anti_patterns TEXT NOT NULL,
                communication_tone TEXT NOT NULL,
                custom_instructions TEXT,
                is_default INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            )
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS optimization_history (
                id TEXT PRIMARY KEY,
                raw_prompt TEXT NOT NULL,
                enhanced_prompt TEXT NOT NULL,
                agent_target TEXT NOT NULL,
                persona_name TEXT,
                precision_score REAL NOT NULL,
                personalization_score REAL NOT NULL,
                user_rating INTEGER DEFAULT NULL,
                feedback TEXT DEFAULT NULL,
                diff_breakdown TEXT NOT NULL,
                metrics TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS learned_insights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                persona_id TEXT,
                insight TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            conn.commit()

    def _seed_default_personas(self):
        existing = self.list_personas()
        if existing:
            return

        defaults = [
            Persona(
                id="default-fullstack",
                name="Senior Full-Stack Architect",
                role="Staff Full-Stack Engineer",
                seniority="Staff",
                tech_stack=["Python 3.12", "FastAPI", "TypeScript", "React", "PostgreSQL", "Docker", "TailwindCSS"],
                style_preferences=[
                    "Strict type safety and zero `any` types",
                    "Modular domain-driven architecture with clean separation of concerns",
                    "Write automated test cases (pytest / vitest) for new logic",
                    "Handle all edge cases, HTTP status codes, and input validation schemas explicitly"
                ],
                anti_patterns=[
                    "No monolithic files or inline massive styles",
                    "Never silently swallow exceptions or leave empty try/except blocks",
                    "Avoid deprecated dependencies or untested external libraries",
                    "Do not alter unrelated existing files without reason"
                ],
                communication_tone="Concise, Technical & Production-Ready",
                custom_instructions="Focus on performance, clean APIs, and production resilience.",
                is_default=True
            ),
            Persona(
                id="default-ai-engineer",
                name="AI / ML Systems Specialist",
                role="Lead AI Research & Systems Engineer",
                seniority="Senior",
                tech_stack=["Python", "PyTorch", "Hugging Face", "LangChain/LangGraph", "LiteLLM", "ChromaDB/Qdrant"],
                style_preferences=[
                    "Deterministic seeding and reproducible random states",
                    "Streaming response patterns with cancellation handling",
                    "Token-efficient prompting and prompt injection guardrails",
                    "Clear structured JSON outputs using Pydantic models"
                ],
                anti_patterns=[
                    "Never hardcode API keys or credentials",
                    "Avoid unbounded memory usage or blocking event loops",
                    "No unvalidated model hallucination or blind regex parsing"
                ],
                communication_tone="Rigorous, Math/Code-Centric",
                custom_instructions="Prioritize prompt security, latency benchmarks, and token economics.",
                is_default=False
            ),
            Persona(
                id="default-frontend-craft",
                name="Modern Frontend & UI Craftsman",
                role="Principal UI/UX Engineer",
                seniority="Principal",
                tech_stack=["Next.js", "React 19", "Tailwind CSS", "TypeScript", "Lucide Icons", "Framer Motion"],
                style_preferences=[
                    "Component reusability and accessible semantic HTML (WCAG AA)",
                    "Graceful loading, empty states, and micro-interactions",
                    "Strict separation between UI presentation and API hooks"
                ],
                anti_patterns=[
                    "No jarring layout shifts or non-responsive tables",
                    "Avoid unnecessary re-renders with proper memoization and state scoping",
                    "No raw inline color codes; use design system tokens"
                ],
                communication_tone="Visually intuitive, Elegant & Modern",
                custom_instructions="Ensure top-tier UX, keyboard navigation, and responsive mobile-first layouts.",
                is_default=False
            )
        ]

        for p in defaults:
            self.create_persona(p)

    def list_personas(self) -> List[Persona]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM personas ORDER BY is_default DESC, name ASC")
            rows = cursor.fetchall()
            personas = []
            for r in rows:
                personas.append(Persona(
                    id=r["id"],
                    name=r["name"],
                    role=r["role"],
                    seniority=r["seniority"],
                    tech_stack=json.loads(r["tech_stack"]),
                    style_preferences=json.loads(r["style_preferences"]),
                    anti_patterns=json.loads(r["anti_patterns"]),
                    communication_tone=r["communication_tone"],
                    custom_instructions=r["custom_instructions"],
                    is_default=bool(r["is_default"]),
                    created_at=r["created_at"]
                ))
            return personas

    def get_persona(self, persona_id: str) -> Optional[Persona]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM personas WHERE id = ?", (persona_id,))
            r = cursor.fetchone()
            if not r:
                return None
            return Persona(
                id=r["id"],
                name=r["name"],
                role=r["role"],
                seniority=r["seniority"],
                tech_stack=json.loads(r["tech_stack"]),
                style_preferences=json.loads(r["style_preferences"]),
                anti_patterns=json.loads(r["anti_patterns"]),
                communication_tone=r["communication_tone"],
                custom_instructions=r["custom_instructions"],
                is_default=bool(r["is_default"]),
                created_at=r["created_at"]
            )

    def get_default_persona(self) -> Persona:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM personas WHERE is_default = 1 LIMIT 1")
            r = cursor.fetchone()
            if r:
                return Persona(
                    id=r["id"],
                    name=r["name"],
                    role=r["role"],
                    seniority=r["seniority"],
                    tech_stack=json.loads(r["tech_stack"]),
                    style_preferences=json.loads(r["style_preferences"]),
                    anti_patterns=json.loads(r["anti_patterns"]),
                    communication_tone=r["communication_tone"],
                    custom_instructions=r["custom_instructions"],
                    is_default=True,
                    created_at=r["created_at"]
                )
        personas = self.list_personas()
        if personas:
            return personas[0]
        # Fallback
        return Persona(id="fallback", name="Default Developer", role="Engineer")

    def create_persona(self, persona: Persona) -> Persona:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if persona.is_default:
                cursor.execute("UPDATE personas SET is_default = 0")
            cursor.execute("""
            INSERT INTO personas (id, name, role, seniority, tech_stack, style_preferences, anti_patterns, communication_tone, custom_instructions, is_default, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                persona.id,
                persona.name,
                persona.role,
                persona.seniority,
                json.dumps(persona.tech_stack),
                json.dumps(persona.style_preferences),
                json.dumps(persona.anti_patterns),
                persona.communication_tone,
                persona.custom_instructions,
                1 if persona.is_default else 0,
                persona.created_at
            ))
            conn.commit()
        return persona

    def update_persona(self, persona_id: str, updates: Dict[str, Any]) -> Optional[Persona]:
        existing = self.get_persona(persona_id)
        if not existing:
            return None
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if updates.get("is_default"):
                cursor.execute("UPDATE personas SET is_default = 0")
            
            for k, v in updates.items():
                if v is not None and hasattr(existing, k):
                    setattr(existing, k, v)
            
            cursor.execute("""
            UPDATE personas SET name=?, role=?, seniority=?, tech_stack=?, style_preferences=?, anti_patterns=?, communication_tone=?, custom_instructions=?, is_default=?
            WHERE id = ?
            """, (
                existing.name,
                existing.role,
                existing.seniority,
                json.dumps(existing.tech_stack),
                json.dumps(existing.style_preferences),
                json.dumps(existing.anti_patterns),
                existing.communication_tone,
                existing.custom_instructions,
                1 if existing.is_default else 0,
                persona_id
            ))
            conn.commit()
        return existing

    def delete_persona(self, persona_id: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM personas WHERE id = ?", (persona_id,))
            conn.commit()
            return cursor.rowcount > 0

    def record_history(self, result: OptimizationResult):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO optimization_history (
                id, raw_prompt, enhanced_prompt, agent_target, persona_name,
                precision_score, personalization_score, diff_breakdown, metrics, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                result.id,
                result.raw_prompt,
                result.enhanced_prompt,
                result.agent_target,
                result.persona_name,
                result.metrics.precision_score,
                result.metrics.personalization_score,
                json.dumps([d.model_dump() for d in result.diff_breakdown]),
                json.dumps(result.metrics.model_dump()),
                result.created_at
            ))
            conn.commit()

    def list_history(self, limit: int = 50) -> List[HistoryItem]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT id, raw_prompt, enhanced_prompt, agent_target, persona_name,
                   precision_score, personalization_score, user_rating, created_at
            FROM optimization_history
            ORDER BY created_at DESC
            LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()
            return [
                HistoryItem(
                    id=r["id"],
                    raw_prompt=r["raw_prompt"],
                    enhanced_prompt=r["enhanced_prompt"],
                    agent_target=r["agent_target"],
                    persona_name=r["persona_name"],
                    precision_score=r["precision_score"],
                    personalization_score=r["personalization_score"],
                    user_rating=r["user_rating"],
                    created_at=r["created_at"]
                ) for r in rows
            ]

    def rate_history_item(self, item_id: str, rating: int, feedback: Optional[str] = None) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            UPDATE optimization_history SET user_rating = ?, feedback = ?
            WHERE id = ?
            """, (rating, feedback, item_id))
            conn.commit()
            return cursor.rowcount > 0

    def add_learned_insight(self, persona_id: str, insight: str):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO learned_insights (persona_id, insight) VALUES (?, ?)", (persona_id, insight))
            conn.commit()
