import re
from typing import List, Dict, Any, Tuple
from app.models.schemas import DiffItem

class PrecisionEngine:
    """
    Precision Engine transforms underspecified prompts into high-precision,
    deterministic agent instructions by injecting constraints, anti-goals,
    edge cases, and strict acceptance criteria.
    """

    def __init__(self):
        # Intent patterns
        self.intent_patterns = {
            "bug_fix": [r"\bfix\b", r"\bbug\b", r"\berror\b", r"\bexception\b", r"\bcrash\b", r"\bfail\b", r"\bissue\b", r"\bdebug\b"],
            "feature": [r"\badd\b", r"\bcreate\b", r"\bbuild\b", r"\bimplement\b", r"\bdevelop\b", r"\bmake\b", r"\bnew\b"],
            "refactor": [r"\brefactor\b", r"\bclean\b", r"\brestructure\b", r"\boptimize\b", r"\bsimplify\b", r"\bmodularize\b"],
            "api_design": [r"\bapi\b", r"\bendpoint\b", r"\broute\b", r"\bcontroller\b", r"\brest\b", r"\bgraphql\b"],
            "testing": [r"\btest\b", r"\bunit\b", r"\bmock\b", r"\bcoverage\b", r"\be2e\b", r"\bpytest\b", r"\bjest\b"],
            "auth": [r"\bauth\b", r"\blogin\b", r"\bjwt\b", r"\btoken\b", r"\bpermission\b", r"\bsession\b", r"\boauth\b"],
            "database": [r"\bdatabase\b", r"\bsql\b", r"\bpostgres\b", r"\bmongo\b", r"\btable\b", r"\bschema\b", r"\bmigration\b"]
        }

    def detect_intents(self, text: str) -> List[str]:
        text_lower = text.lower()
        detected = []
        for intent, patterns in self.intent_patterns.items():
            if any(re.search(p, text_lower) for p in patterns):
                detected.append(intent)
        if not detected:
            detected.append("feature")
        return detected

    def generate_precision_elements(
        self,
        raw_prompt: str,
        enable_anti_goals: bool = True,
        enable_edge_cases: bool = True,
        enable_schemas: bool = True
    ) -> Tuple[Dict[str, Any], List[DiffItem], Dict[str, int]]:
        """
        Synthesizes precision constraints tailored to the prompt's intent.
        """
        intents = self.detect_intents(raw_prompt)
        text_lower = raw_prompt.lower()
        
        diff_items = []
        constraints = []
        anti_goals = []
        edge_cases = []
        verification_steps = []
        schema_contract = ""

        # 1. Base Precision Guardrails (Universal to High-Performance Agents)
        constraints.append("Atomic & Focused Scope: Modify only the minimal necessary files and logic to achieve the goal.")
        diff_items.append(DiffItem(
            category="constraint",
            title="Scope Boundary Enforcement",
            content="Atomic & Focused Scope: Modify only the minimal necessary files.",
            reason="Prevents AI agents from undertaking sprawling, unrequested refactors."
        ))

        # 2. Intent-Specific Constraints & Edge Cases
        if "bug_fix" in intents:
            constraints.append("Root-Cause Resolution: Fix the fundamental bug rather than masking symptoms or adding workarounds.")
            constraints.append("Backwards Compatibility: Ensure existing working callers and test suites remain unbroken.")
            verification_steps.append("Write a regression test reproducing the failure before confirming the fix.")
            diff_items.append(DiffItem(
                category="constraint",
                title="Root-Cause & Regression Guard",
                content="Fix fundamental root cause and ensure backward compatibility.",
                reason="Eliminates temporary band-aids and prevents breaking dependent modules."
            ))

        if "auth" in intents:
            constraints.append("Security Baseline: Hash all passwords/tokens securely (e.g. bcrypt/Argon2); never log sensitive credentials in plaintext.")
            edge_cases.append("Expired tokens, malformed JWT headers, unauthorized roles, and replay attacks.")
            diff_items.append(DiffItem(
                category="edge_case",
                title="Security & Auth Edge Cases",
                content="Token expiration, malformed headers, privilege escalation prevention.",
                reason="Protects authentication workflows from common vulnerabilities (CWE/OWASP)."
            ))

        if "api_design" in intents or "database" in intents:
            constraints.append("Idempotency & Clean Status Codes: Return standard HTTP status codes (200, 201, 400, 401, 404, 422, 500) with uniform error schemas.")
            edge_cases.append("Database connection timeouts, transaction rollbacks on failure, unique constraint collisions, and pagination limits.")
            diff_items.append(DiffItem(
                category="schema",
                title="Uniform API Error & Response Schema",
                content="Standard status codes, transaction rollbacks, consistent JSON payload envelope.",
                reason="Guarantees predictable integration for frontend and downstream consumers."
            ))

        # 3. Input Validation & Edge Cases
        if enable_edge_cases:
            edge_cases.extend([
                "Empty, null, undefined, or excessively large input payloads.",
                "Network timeouts, unreachable external dependencies, or unhandled promise rejections.",
                "Boundary condition handling (e.g. 0 items, off-by-one errors, negative numbers, extreme inputs)."
            ])
            diff_items.append(DiffItem(
                category="edge_case",
                title="Boundary & Edge Condition Specifications",
                content="Null safety, empty payloads, timeouts, boundary numbers.",
                reason="Forces the agent to program defensively against edge failures."
            ))

        # 4. Anti-Goals (Explicit exclusions)
        if enable_anti_goals:
            anti_goals.extend([
                "DO NOT introduce new unvetted third-party dependencies when standard libraries or existing packages suffice.",
                "DO NOT delete or rewrite working unit tests to force a pass; fix the underlying code.",
                "DO NOT leave placeholders, TODOs, or mock implementations in final deliverables.",
                "DO NOT hardcode environment variables, secrets, or hostnames."
            ])
            diff_items.append(DiffItem(
                category="anti_goal",
                title="Deterministic Anti-Goals",
                content="No unvetted dependencies, no deleted tests, no uncompleted TODOs, no hardcoded secrets.",
                reason="Establishes rigid boundary lines against typical LLM agent failure modes."
            ))

        # 5. Output Schemas & Verification
        if enable_schemas:
            schema_contract = "Deliver code with complete typed interfaces, self-documenting naming, and executable verification steps."
            verification_steps.append("Validate syntax, type checks, and run relevant test suites before marking task complete.")

        precision_data = {
            "intents": intents,
            "constraints": constraints,
            "anti_goals": anti_goals,
            "edge_cases": edge_cases,
            "verification_steps": verification_steps,
            "schema_contract": schema_contract
        }

        counts = {
            "constraints": len(constraints),
            "edge_cases": len(edge_cases),
            "anti_goals": len(anti_goals)
        }

        return precision_data, diff_items, counts
