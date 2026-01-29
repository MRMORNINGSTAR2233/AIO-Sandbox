from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.agent.service import AgentService
from app.rl.router import router as rl_router

app = FastAPI(title="AI Sandbox API")
app.include_router(rl_router)
agent_service = AgentService()

class ChatRequest(BaseModel):
    message: str
    provider: str = "openai"
    model: str = "gpt-3.5-turbo"
    temperature: float = 0.7

@app.get("/")
def read_root():
    return {"status": "ok", "message": "AI Sandbox API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Update config if needed
        agent_service.update_agent_config(request.provider, request.model, request.temperature)
        response = await agent_service.process_message(request.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
