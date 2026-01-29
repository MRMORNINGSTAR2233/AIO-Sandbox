from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, List
from app.rl.env_manager import EnvManager

router = APIRouter(prefix="/envs", tags=["rl"])
env_manager = EnvManager()

class CreateEnvRequest(BaseModel):
    env_id: str

class StepRequest(BaseModel):
    session_id: str
    action: int

@router.get("/")
def list_envs():
    return {"envs": env_manager.list_envs()}

@router.post("/create")
def create_env(request: CreateEnvRequest):
    try:
        session_id = env_manager.create_env(request.env_id)
        return {"session_id": session_id, "status": "created"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/reset/{session_id}")
def reset_env(session_id: str):
    try:
        result = env_manager.reset(session_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/step")
def step_env(request: StepRequest):
    try:
        result = env_manager.step(request.session_id, request.action)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{session_id}")
def close_env(session_id: str):
    env_manager.close(session_id)
    return {"status": "closed"}
