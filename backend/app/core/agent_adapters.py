from typing import Dict, Any, List

class AgentAdapter:
    """
    Formats the synthesized personalized & precision-enhanced prompt
    into the optimal prompt schema for specific AI agent architectures.
    """

    SUPPORTED_TARGETS = [
        {"id": "coding_agent", "name": "Coding Agent (Cursor / Claude Code / Aider)", "description": "Optimized for autonomous file editing, minimal diffs, and regression prevention."},
        {"id": "workflow_agent", "name": "Workflow Agent (LangGraph / CrewAI / AutoGen)", "description": "Structured for multi-step tool-calling, state validation, and termination criteria."},
        {"id": "reasoning_model", "name": "Reasoning Model (o1 / DeepSeek-R1 / Gemini Thinking)", "description": "Pure formal specifications and mathematical/logical constraints without CoT fluff."},
        {"id": "general_chat", "name": "General Assistant (GPT-4o / Claude / Gemini)", "description": "Clean, structured markdown prompt with comprehensive context and instructions."}
    ]

    def format_prompt(
        self,
        raw_prompt: str,
        target: str,
        personalization: Dict[str, Any],
        precision: Dict[str, Any]
    ) -> str:
        """
        Compiles the components into an agent-ready prompt.
        """
        if target == "coding_agent":
            return self._format_coding_agent(raw_prompt, personalization, precision)
        elif target == "workflow_agent":
            return self._format_workflow_agent(raw_prompt, personalization, precision)
        elif target == "reasoning_model":
            return self._format_reasoning_model(raw_prompt, personalization, precision)
        else:
            return self._format_general_chat(raw_prompt, personalization, precision)

    def _format_coding_agent(self, raw_prompt: str, p: Dict[str, Any], prec: Dict[str, Any]) -> str:
        sections = []

        # Role & Target Frame
        if "role_framing" in p:
            sections.append(f"> **Role**: {p['role_framing']}")
        
        # Primary Objective
        sections.append(f"## 1. Primary Objective\n{raw_prompt.strip()}")

        # Tech Stack & Environment
        stack_lines = []
        if "tech_stack" in p:
            stack_lines.append(f"- **Stack**: {p['tech_stack']}")
        if "workspace_context" in p:
            stack_lines.append(f"- **Workspace Context**: {p['workspace_context']}")
        if stack_lines:
            sections.append("## 2. Tech Stack & Environment\n" + "\n".join(stack_lines))

        # Precision Constraints
        constraints = prec.get("constraints", [])
        if "style_preferences" in p:
            constraints.extend([f"Personal Preference: {pref}" for pref in p["style_preferences"]])
        if constraints:
            sections.append("## 3. Strict Constraints & Quality Standards\n" + "\n".join(f"- {c}" for c in constraints))

        # Edge Cases
        edge_cases = prec.get("edge_cases", [])
        if edge_cases:
            sections.append("## 4. Critical Edge Cases to Guard Against\n" + "\n".join(f"- [ ] {e}" for e in edge_cases))

        # Anti-Goals
        anti_goals = prec.get("anti_goals", [])
        if "anti_patterns" in p:
            anti_goals.extend([f"User Rule: {ap}" for ap in p["anti_patterns"]])
        if anti_goals:
            sections.append("## 5. Anti-Goals (Strictly Prohibited)\n" + "\n".join(f"- [x] {ag}" for ag in anti_goals))

        # Verification Protocol
        verif = prec.get("verification_steps", [])
        if verif:
            sections.append("## 6. Execution & Self-Verification Protocol\n" + "\n".join(f"{i+1}. {v}" for i, v in enumerate(verif)))

        # Tone / Format
        if "tone" in p:
            sections.append(f"_{p['tone']}_")

        return "\n\n".join(sections)

    def _format_workflow_agent(self, raw_prompt: str, p: Dict[str, Any], prec: Dict[str, Any]) -> str:
        lines = [
            "# TASK SPECIFICATION FOR AUTONOMOUS AGENT",
            f"GOAL: {raw_prompt.strip()}",
            "",
            "## CONTEXT & CONSTRAINTS",
            f"- Role Context: {p.get('role_framing', 'Autonomous Specialist')}",
            f"- Environment: {p.get('tech_stack', 'Default Environment')}",
        ]

        if "workspace_context" in p:
            lines.append(f"- Project Workspace: {p['workspace_context']}")

        lines.append("\n## MANDATORY GUARDRAILS")
        for c in prec.get("constraints", []):
            lines.append(f"- MUST: {c}")
        for ag in prec.get("anti_goals", []):
            lines.append(f"- MUST NOT: {ag}")

        lines.append("\n## STATE VALIDATION & VERIFICATION")
        for v in prec.get("verification_steps", []):
            lines.append(f"- Checkpoint: {v}")

        lines.append("\n## TERMINATION CONDITION")
        lines.append("Return execution status: SUCCESS only when all edge cases are addressed and verification criteria pass.")
        return "\n".join(lines)

    def _format_reasoning_model(self, raw_prompt: str, p: Dict[str, Any], prec: Dict[str, Any]) -> str:
        # Reasoning models prefer dense, formal, objective constraints
        lines = [
            f"OBJECTIVE: {raw_prompt.strip()}",
            "",
            "SPECIFICATIONS & INVARIANTS:"
        ]
        if "tech_stack" in p:
            lines.append(f"1. Technology Constraints: {p['tech_stack']}")
        
        idx = 2
        for c in prec.get("constraints", []):
            lines.append(f"{idx}. Invariant: {c}")
            idx += 1
        
        for e in prec.get("edge_cases", []):
            lines.append(f"{idx}. Boundary Condition: {e}")
            idx += 1

        for ag in prec.get("anti_goals", []):
            lines.append(f"{idx}. Non-Goal / Exclusion: {ag}")
            idx += 1

        lines.append("\nDELIVERABLE:")
        lines.append("Provide complete, syntactically valid code/solution adhering strictly to all invariants above.")
        return "\n".join(lines)

    def _format_general_chat(self, raw_prompt: str, p: Dict[str, Any], prec: Dict[str, Any]) -> str:
        lines = [
            f"### Request\n{raw_prompt.strip()}\n",
            "### Context & Requirements"
        ]
        if "role_framing" in p:
            lines.append(f"- **Perspective**: {p['role_framing']}")
        if "tech_stack" in p:
            lines.append(f"- **Tech Stack**: {p['tech_stack']}")
        
        for c in prec.get("constraints", []):
            lines.append(f"- **Constraint**: {c}")

        for e in prec.get("edge_cases", []):
            lines.append(f"- **Edge Case**: {e}")

        for ag in prec.get("anti_goals", []):
            lines.append(f"- **Do Not**: {ag}")

        lines.append(f"\n*{p.get('tone', 'Respond with precise, production-grade output.')}*")
        return "\n".join(lines)
