from typing import List, Dict, Any, Tuple
from app.models.schemas import Persona, DiffItem

class PersonalizationEngine:
    """
    Engine responsible for infusing user-specific style, tech stack,
    seniority conventions, and project memory into the prompt.
    """

    def apply_personalization(
        self,
        raw_prompt: str,
        persona: Persona,
        workspace_context: str = None
    ) -> Tuple[Dict[str, Any], List[DiffItem], float]:
        """
        Returns:
            - personalized_directives: Dict containing role context, stack rules, style rules
            - diff_items: List of diff items explaining added personalization
            - score: Personalization alignment score (0-100)
        """
        directives = {}
        diff_items = []
        raw_lower = raw_prompt.lower()

        # 1. Role and Seniority Alignment
        role_directive = f"Act as a {persona.seniority} {persona.role}. Adhere to high production standards, robust error resilience, and maintainable architecture."
        directives["role_framing"] = role_directive
        diff_items.append(DiffItem(
            category="personalization",
            title=f"Role Framing: {persona.seniority} {persona.role}",
            content=role_directive,
            reason=f"Aligns output sophistication and architecture to {persona.name}'s seniority level."
        ))

        # 2. Tech Stack Filtering (detect relevance or inject default preferences)
        relevant_stack = []
        for tech in persona.tech_stack:
            tech_lower = tech.lower()
            # If prompt mentions related keywords or stack item
            if any(k in raw_lower for k in [tech_lower, "api", "backend", "frontend", "ui", "db", "database", "model", "test"]) or len(persona.tech_stack) <= 5:
                relevant_stack.append(tech)

        if not relevant_stack and persona.tech_stack:
            relevant_stack = persona.tech_stack[:4]

        if relevant_stack:
            stack_directive = f"Target Tech Stack: {', '.join(relevant_stack)}. Strictly leverage these idiomatic patterns and APIs."
            directives["tech_stack"] = stack_directive
            diff_items.append(DiffItem(
                category="personalization",
                title="Personal Tech Stack Injection",
                content=stack_directive,
                reason="Prevents generic library suggestions and enforces preferred frameworks."
            ))

        # 3. Style Preferences
        if persona.style_preferences:
            directives["style_preferences"] = persona.style_preferences
            diff_items.append(DiffItem(
                category="personalization",
                title="Personal Style & Quality Rules",
                content="; ".join(persona.style_preferences[:3]),
                reason="Applies user's custom coding guidelines, strict type checks, and conventions."
            ))

        # 4. Anti-Patterns (Personal Dislikes)
        if persona.anti_patterns:
            directives["anti_patterns"] = persona.anti_patterns
            diff_items.append(DiffItem(
                category="anti_goal",
                title="Personal Anti-Patterns",
                content="; ".join(persona.anti_patterns[:3]),
                reason="Forbids habits, libraries, or patterns the user explicitly avoids."
            ))

        # 5. Tone & Output Format
        directives["tone"] = f"Output Tone: {persona.communication_tone}. Avoid conversational filler and focus purely on functional execution."

        # 6. Workspace Context (if provided)
        if workspace_context and workspace_context.strip():
            directives["workspace_context"] = workspace_context.strip()
            diff_items.append(DiffItem(
                category="personalization",
                title="Active Workspace Context",
                content=f"Context: {workspace_context[:100]}...",
                reason="Grounds the AI agent in the user's specific repository and environment."
            ))

        # 7. Custom Instructions
        if persona.custom_instructions and persona.custom_instructions.strip():
            directives["custom_instructions"] = persona.custom_instructions.strip()

        # Calculate Personalization Score
        # Max score is 100 based on presence of tech stack, style, anti-patterns, and context
        score_parts = 0
        if relevant_stack: score_parts += 30
        if persona.style_preferences: score_parts += 25
        if persona.anti_patterns: score_parts += 20
        if persona.role: score_parts += 15
        if workspace_context: score_parts += 10
        personalization_score = min(100.0, float(score_parts))

        return directives, diff_items, personalization_score
