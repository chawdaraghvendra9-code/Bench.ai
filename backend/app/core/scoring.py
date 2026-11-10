import re
from typing import Dict, Any
from app.models.schemas import PrecisionMetric

class ScoringEngine:
    """
    Computes precision scores, personalization depth, and ambiguity reduction metrics.
    """

    AMBIGUOUS_WORDS = {
        "fix", "build", "make", "create", "do", "help", "check", "clean",
        "improve", "fast", "good", "better", "stuff", "thing", "something",
        "working", "properly", "nice", "simple"
    }

    def compute_metrics(
        self,
        raw_prompt: str,
        enhanced_prompt: str,
        personalization_score: float,
        counts: Dict[str, int]
    ) -> PrecisionMetric:
        # 1. Analyze Raw Prompt Ambiguity
        words = re.findall(r"\w+", raw_prompt.lower())
        word_count = len(words)
        
        ambiguity_hits = sum(1 for w in words if w in self.AMBIGUOUS_WORDS)
        raw_ambiguity_ratio = (ambiguity_hits / max(word_count, 1))

        # Raw precision baseline
        # Short or vague prompts start with low precision
        raw_precision = max(15.0, min(50.0, (word_count * 2.5) - (raw_ambiguity_ratio * 40.0)))

        # 2. Enhanced Precision Calculation
        # Increments based on precision components
        c_score = min(35.0, counts.get("constraints", 0) * 8.0)
        e_score = min(25.0, counts.get("edge_cases", 0) * 6.0)
        ag_score = min(20.0, counts.get("anti_goals", 0) * 5.0)
        structural_score = 15.0 if "##" in enhanced_prompt or "SPECIFICATIONS" in enhanced_prompt else 5.0

        enhanced_precision = min(98.5, round(c_score + e_score + ag_score + structural_score, 1))

        # 3. Ambiguity Reduction
        # Difference between original ambiguity and enhanced precision clarity
        ambiguity_reduction = min(92.0, max(45.0, round(((enhanced_precision - raw_precision) / 100.0) * 110.0, 1)))

        return PrecisionMetric(
            precision_score=enhanced_precision,
            personalization_score=round(personalization_score, 1),
            ambiguity_reduction_pct=ambiguity_reduction,
            constraints_added=counts.get("constraints", 0),
            edge_cases_identified=counts.get("edge_cases", 0),
            anti_goals_specified=counts.get("anti_goals", 0)
        )
