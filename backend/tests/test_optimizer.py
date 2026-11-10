import os
import sys
import pytest

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient

from app.main import app
from app.models.schemas import OptimizeRequest, Persona
from app.core.optimizer import PromptOptimizer
from app.storage.memory_store import MemoryStore

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_list_personas():
    response = client.get("/api/personas")
    assert response.status_code == 200
    personas = response.json()
    assert len(personas) >= 3
    # Check default persona exists
    defaults = [p for p in personas if p["is_default"]]
    assert len(defaults) == 1

def test_prompt_optimization_pipeline():
    optimizer = PromptOptimizer()
    req = OptimizeRequest(
        raw_prompt="add jwt authentication and fix error handling in api",
        agent_target="coding_agent",
        enable_anti_goals=True,
        enable_edge_cases=True,
        enable_schemas=True
    )
    res = optimizer.optimize(req)

    # Check that enhanced prompt has structure and precision elements
    assert "## 1. Primary Objective" in res.enhanced_prompt
    assert "## 3. Strict Constraints" in res.enhanced_prompt
    assert "## 4. Critical Edge Cases" in res.enhanced_prompt
    assert "## 5. Anti-Goals" in res.enhanced_prompt
    
    # Check metrics
    assert res.metrics.precision_score > 70.0
    assert res.metrics.personalization_score > 50.0
    assert res.metrics.constraints_added > 0
    assert res.metrics.edge_cases_identified > 0
    assert len(res.diff_breakdown) > 0

def test_api_optimize_endpoint():
    payload = {
        "raw_prompt": "build a responsive data table with sorting and search",
        "agent_target": "coding_agent"
    }
    response = client.post("/api/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "enhanced_prompt" in data
    assert "metrics" in data
    assert data["metrics"]["precision_score"] > 50.0

def test_openai_proxy_mock_response():
    payload = {
        "model": "bench-optimizer-v1",
        "messages": [
            {"role": "user", "content": "refactor database query to prevent sql injection"}
        ]
    }
    response = client.post("/v1/chat/completions", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "choices" in data
    assert len(data["choices"]) > 0
    content = data["choices"][0]["message"]["content"]
    assert "Bench.ai Precision Optimizer Applied" in content

def test_history_and_ratings():
    # Fetch history
    response = client.get("/api/history")
    assert response.status_code == 200
    items = response.json()
    assert len(items) > 0

    first_id = items[0]["id"]
    # Rate the item
    rate_resp = client.post(f"/api/history/{first_id}/rate", json={"rating": 1, "feedback": "Super precise!"})
    assert rate_resp.status_code == 200
    assert rate_resp.json()["status"] == "success"
