import os
import json
import time
import httpx
from typing import List, Dict, Any, Optional
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from app.core.optimizer import PromptOptimizer
from app.models.schemas import OptimizeRequest

class OpenAIProxyHandler:
    def __init__(self, optimizer: PromptOptimizer):
        self.optimizer = optimizer
        self.upstream_base_url = os.getenv("UPSTREAM_LLM_URL", "https://api.openai.com/v1")
        self.upstream_api_key = os.getenv("OPENAI_API_KEY", "")

    async def handle_chat_completions(self, payload: Dict[str, Any]):
        messages = payload.get("messages", [])
        if not messages:
            raise HTTPException(status_code=400, detail="Messages array cannot be empty")

        # Find the last user message to auto-optimize
        last_user_idx = None
        for i in reversed(range(len(messages))):
            if messages[i].get("role") == "user":
                last_user_idx = i
                break

        if last_user_idx is not None:
            user_content = messages[last_user_idx].get("content", "")
            if isinstance(user_content, str) and user_content.strip():
                # Auto-optimize with Personalization + Precision
                opt_req = OptimizeRequest(
                    raw_prompt=user_content,
                    agent_target="coding_agent"
                )
                result = self.optimizer.optimize(opt_req)
                messages[last_user_idx]["content"] = result.enhanced_prompt

        # If upstream API key is available, forward request
        if self.upstream_api_key:
            return await self._forward_upstream(payload)

        # Otherwise, return an OpenAI-compatible response containing the enhanced prompt
        enhanced_text = messages[last_user_idx]["content"] if last_user_idx is not None else "No user prompt found"
        created_ts = int(time.time())
        response_data = {
            "id": f"chatcmpl-bench-{created_ts}",
            "object": "chat.completion",
            "created": created_ts,
            "model": payload.get("model", "bench-optimizer-v1"),
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": f"[Bench.ai Precision Optimizer Applied]\n\nYour prompt was upgraded with active Persona & Precision Guardrails:\n\n{enhanced_text}"
                    },
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": len(enhanced_text.split()),
                "completion_tokens": 120,
                "total_tokens": len(enhanced_text.split()) + 120
            }
        }
        return JSONResponse(content=response_data)

    async def _forward_upstream(self, payload: Dict[str, Any]):
        headers = {
            "Authorization": f"Bearer {self.upstream_api_key}",
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{self.upstream_base_url}/chat/completions",
                json=payload,
                headers=headers
            )
            return JSONResponse(content=resp.json(), status_code=resp.status_code)

    def get_models(self) -> Dict[str, Any]:
        return {
            "object": "list",
            "data": [
                {"id": "bench-optimizer-v1", "object": "model", "owned_by": "bench-ai"},
                {"id": "gpt-4o", "object": "model", "owned_by": "openai"},
                {"id": "claude-3-7-sonnet", "object": "model", "owned_by": "anthropic"}
            ]
        }
