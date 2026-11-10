# Bench.ai ⚡
### Autonomous Prompt Auto-Optimizer for AI Agents (Precision & Personalization)

**Bench.ai** is a full-stack studio, engine, and drop-in proxy that elevates vague human instructions into high-precision, hyper-personalized, deterministic prompts designed specifically for autonomous AI agents (Cursor, Claude Code, Aider, LangGraph, CrewAI).

---

## 🌟 Key Features

1. **Precision Engineering Engine**:
   - **Intent Deconstruction**: Classifies goals, detects implicit requirements, and eliminates ambiguity.
   - **Defensive Boundary Hardening**: Injects critical edge cases (timeouts, null payloads, token expiration, concurrency).
   - **Deterministic Anti-Goals**: Forbids unwanted patterns, unvetted libraries, and destructive modifications.
   - **Verification Protocols**: Demands step-by-step assertions, type checking, and automated test reproduction.

2. **Personalization & Context Memory Layer**:
   - **User Persona Modeling**: Adapts prompts to developer seniority (Junior, Senior, Staff, Founder) and role.
   - **Preferred Tech Stacks**: Enforces idiomatic patterns for your preferred stack (e.g. FastAPI, React 19, TypeScript strict mode).
   - **Quality & Style Standards**: Custom coding rules and anti-patterns automatically injected.
   - **Active Workspace Context**: Ingests active repo architecture and conventions.

3. **Multi-Agent Architecture Adapters**:
   - **Coding Agents** (Cursor, Claude Code, GitHub Copilot, Aider): Optimized for file-scoped diffs and regression prevention.
   - **Workflow Agents** (LangGraph, CrewAI, AutoGen): Structured for tool-calling steps, state checkpoints, and termination criteria.
   - **Reasoning Models** (o1, DeepSeek-R1, Gemini Thinking): Formal specifications and mathematical/logical invariants without CoT fluff.
   - **General Conversational LLMs** (Claude 3.7 Sonnet, GPT-4o).

4. **Drop-in AI Proxy (`/v1/chat/completions`)**:
   - Point **Cursor**, **Cline**, or any OpenAI-compatible client to `http://localhost:8000/v1`.
   - Your prompts are automatically intercepted, personalized, upgraded with precision guardrails, and executed!

5. **Interactive Full-Stack Web Studio**:
   - Live side-by-side diff comparison (Original vs. Agent-Ready).
   - Real-time **Precision Scorecard** (Precision Score, Personalization %, Ambiguity Reduction).
   - Persona Studio for managing multiple developer profiles.
   - 1-click Copy, Markdown export, and Prompt History with rating feedback.

---

## 🚀 Quickstart

### 1. Backend Setup & Startup

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the backend API & proxy (runs on port 8000)
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Studio Startup

```bash
# Navigate to frontend
cd frontend

# Install packages
npm install

# Start Vite dev server (runs on port 5173 with proxy to 8000)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🛠️ Drop-in Proxy Configuration

You can use Bench.ai transparently with your existing tools without changing code:

### For Cursor IDE:
1. Open Cursor **Settings** -> **Models** -> **OpenAI API Key**.
2. Set **Override OpenAI Base URL** to: `http://localhost:8000/v1`
3. Any prompt typed in Cursor Composer or Chat is automatically upgraded!

### For Python / LangChain / CrewAI:
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="bench-local"
)

response = client.chat.completions.create(
    model="bench-optimizer-v1",
    messages=[{"role": "user", "content": "add jwt authentication"}]
)
```

---

## 🧪 Testing

Run backend tests:
```bash
python -m pytest
```

Build frontend:
```bash
cd frontend && npm run build
```

---

## 📂 Project Structure

```
Bench.ai/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── agent_adapters.py        # Target agent formatters (Coding, Workflow, Reasoning)
│   │   │   ├── optimizer.py             # Unified optimization pipeline
│   │   │   ├── personalization_engine.py# User persona & style injection
│   │   │   ├── precision_engine.py      # Ambiguity reduction, constraints & anti-goals
│   │   │   └── scoring.py               # Precision and ambiguity metrics
│   │   ├── models/schemas.py            # Pydantic data models
│   │   ├── proxy/openai_proxy.py        # /v1/chat/completions drop-in proxy
│   │   ├── storage/memory_store.py      # SQLite persona and history store
│   │   └── main.py                      # FastAPI server
│   ├── requirements.txt
│   └── tests/test_optimizer.py
├── frontend/
│   ├── src/
│   │   ├── components/                  # Scorecard, DiffViewer, Playground, PersonaModal, ProxyModal
│   │   ├── api/client.ts                # REST API client
│   │   └── App.tsx                      # Main Studio application
│   └── package.json
└── README.md
```
