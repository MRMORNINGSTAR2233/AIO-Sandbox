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

app = FastAPI(title="AI Sandbox API", dependencies=[Depends(get_api_key)])
app.include_router(rl_router)
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
async def chat(request: ChatRequest):
    try:
        # Update config with mode
        agent_service.update_agent_config(request.provider, request.model, request.temperature, request.mode)
        response = await agent_service.process_message(request.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
