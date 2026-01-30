from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from starlette.status import HTTP_403_FORBIDDEN
from pydantic import BaseModel
from app.agent.service import AgentService
from app.rl.router import router as rl_router
import os

API_KEY_NAME = "X-Sandbox-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(api_key_header: str = Security(api_key_header)):
    # In production, use a secure secret manager.
    # For this sandbox, we check against an env var or default to "secret" if not set (for demo)
    expected_key = os.getenv("SANDBOX_API_KEY", "sandbox-secret")
    if api_key_header == expected_key:
        return api_key_header
    raise HTTPException(
        status_code=HTTP_403_FORBIDDEN, detail="Could not validate credentials"
    )

from app.rl.router import router as rl_router
from app.agent.router import router as agent_router
from app.sandbox.router import router as sandbox_router
from app.eval.router import router as eval_router
from app.agent.tools_router import router as tools_router
from app.memory.router import router as memory_router
from app.observability.router import router as obs_router
from app.safety.limiter import limiter, _rate_limit_exceeded_handler, RateLimitExceeded
from fastapi import Request

app = FastAPI(title="AI Sandbox API", dependencies=[Depends(get_api_key)])

# Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(rl_router)
app.include_router(agent_router)
app.include_router(sandbox_router)
app.include_router(eval_router)
app.include_router(tools_router)
app.include_router(memory_router)
app.include_router(obs_router)
agent_service = AgentService()

class ChatRequest(BaseModel):
    message: str
    provider: str = "openai"
    model: str = "gpt-3.5-turbo"
    temperature: float = 0.7
    mode: str = "chat" # chat or agent

@app.get("/")
def read_root():
    return {"status": "ok", "message": "AI Sandbox API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/chat")
@limiter.limit("10/minute")
async def chat(request: ChatRequest, request_context: Request): # Request context needed for limiter
    try:
        # Update config with mode
        agent_service.agent.update_config(request.provider, request.model, request.temperature, request.mode == "agent")
        response = await agent_service.process_message(request.message, use_rag=request.use_rag)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
