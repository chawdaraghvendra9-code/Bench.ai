import uuid
from datetime import datetime, timezone
from typing import Optional
from app.models.schemas import OptimizeRequest, OptimizationResult, Persona
from app.storage.memory_store import MemoryStore
from app.core.personalization_engine import PersonalizationEngine
from app.core.precision_engine import PrecisionEngine
from app.core.agent_adapters import AgentAdapter
from app.core.scoring import ScoringEngine

class PromptOptimizer:
    def __init__(self, memory_store: Optional[MemoryStore] = None):
        self.memory_store = memory_store or MemoryStore()
        self.personalization_engine = PersonalizationEngine()
        self.precision_engine = PrecisionEngine()
        self.agent_adapter = AgentAdapter()
        self.scoring_engine = ScoringEngine()

    def optimize(self, req: OptimizeRequest) -> OptimizationResult:
        # 1. Fetch Persona
        persona = None
        if req.persona_id:
            persona = self.memory_store.get_persona(req.persona_id)
        if not persona:
            persona = self.memory_store.get_default_persona()

        # 2. Apply Personalization
        p_directives, p_diffs, p_score = self.personalization_engine.apply_personalization(
            raw_prompt=req.raw_prompt,
            persona=persona,
            workspace_context=req.workspace_context
        )

        # 3. Apply Precision Engineering
        prec_elements, prec_diffs, counts = self.precision_engine.generate_precision_elements(
            raw_prompt=req.raw_prompt,
            enable_anti_goals=req.enable_anti_goals,
            enable_edge_cases=req.enable_edge_cases,
            enable_schemas=req.enable_schemas
        )

        # 4. Agent Format Adaptation
        enhanced_prompt = self.agent_adapter.format_prompt(
            raw_prompt=req.raw_prompt,
            target=req.agent_target,
            personalization=p_directives,
            precision=prec_elements
        )

        # 5. Compute Metrics
        metrics = self.scoring_engine.compute_metrics(
            raw_prompt=req.raw_prompt,
            enhanced_prompt=enhanced_prompt,
            personalization_score=p_score,
            counts=counts
        )

        # 6. Aggregate Diff Breakdown
        all_diffs = p_diffs + prec_diffs

        # 7. Construct Result
        result = OptimizationResult(
            id=str(uuid.uuid4()),
            raw_prompt=req.raw_prompt,
            enhanced_prompt=enhanced_prompt,
            agent_target=req.agent_target,
            persona_name=persona.name if persona else "Default",
            metrics=metrics,
            diff_breakdown=all_diffs,
            created_at=datetime.now(timezone.utc).isoformat()
        )

        # 8. Record in history
        self.memory_store.record_history(result)

        return result
