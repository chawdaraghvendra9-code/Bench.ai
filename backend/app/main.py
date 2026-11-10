import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional

from app.models.schemas import (
    OptimizeRequest, OptimizationResult, Persona, PersonaUpdate,
    HistoryItem, RatingRequest
)
from app.storage.memory_store import MemoryStore
from app.core.optimizer import PromptOptimizer
from app.core.agent_adapters import AgentAdapter
from app.proxy.openai_proxy import OpenAIProxyHandler

app = FastAPI(
    title="Bench.ai - Prompt Auto-Optimizer for AI Agents",
    description="Precision and Personalization Middleware for AI Agents",
    version="1.0.0"
)

# Enable CORS for frontend studio
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

memory_store = MemoryStore()
optimizer = PromptOptimizer(memory_store=memory_store)
proxy_handler = OpenAIProxyHandler(optimizer=optimizer)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Bench.ai Optimizer", "version": "1.0.0"}

# --- Prompt Optimization Endpoints ---

@app.post("/api/optimize", response_model=OptimizationResult)
def optimize_prompt(req: OptimizeRequest):
    try:
        return optimizer.optimize(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Persona Management Endpoints ---

@app.get("/api/personas", response_model=List[Persona])
def list_personas():
    return memory_store.list_personas()

@app.post("/api/personas", response_model=Persona)
def create_persona(persona: Persona):
    return memory_store.create_persona(persona)

@app.put("/api/personas/{persona_id}", response_model=Persona)
def update_persona(persona_id: str, updates: PersonaUpdate):
    updated = memory_store.update_persona(persona_id, updates.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Persona not found")
    return updated

@app.delete("/api/personas/{persona_id}")
def delete_persona(persona_id: str):
    success = memory_store.delete_persona(persona_id)
    if not success:
        raise HTTPException(status_code=404, detail="Persona not found")
    return {"status": "deleted", "id": persona_id}

# --- History & Feedback Endpoints ---

@app.get("/api/history", response_model=List[HistoryItem])
def get_history(limit: int = 50):
    return memory_store.list_history(limit=limit)

@app.post("/api/history/{item_id}/rate")
def rate_history(item_id: str, req: RatingRequest):
    success = memory_store.rate_history_item(item_id, req.rating, req.feedback)
    if not success:
        raise HTTPException(status_code=404, detail="History record not found")
    return {"status": "success", "rating": req.rating}

# --- Presets & Agent Adapters ---

@app.get("/api/presets")
def get_presets():
    return {
        "targets": AgentAdapter.SUPPORTED_TARGETS,
        "sample_prompts": [
            {
                "title": "JWT Auth with Refresh Tokens",
                "category": "Security / Backend",
                "prompt": "add jwt authentication to my endpoints with refresh token rotation"
            },
            {
                "title": "Fix Memory Leak in Event Listener",
                "category": "Debugging / Performance",
                "prompt": "fix the memory leak when unmounting websocket subscribers in my client"
            },
            {
                "title": "Responsive Data Grid with Filters",
                "category": "Frontend UI",
                "prompt": "build a data table with column sorting, fuzzy search, and pagination"
            },
            {
                "title": "Database Transaction Rollback on Failure",
                "category": "Database / API",
                "prompt": "create an order checkout endpoint that deducts inventory and charges card"
            }
        ]
    }

# --- Drop-in OpenAI Proxy Compatibility Layer ---

@app.post("/v1/chat/completions")
async def chat_completions(req: Request):
    payload = await req.json()
    return await proxy_handler.handle_chat_completions(payload)

@app.get("/v1/models")
def get_models():
    return proxy_handler.get_models()
