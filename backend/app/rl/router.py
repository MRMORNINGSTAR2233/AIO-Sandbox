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

from fastapi import UploadFile, File
import shutil
import os

@router.post("/upload")
async def upload_env(file: UploadFile = File(...)):
    upload_dir = "custom_envs"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Attempt to register
    module_name = file.filename.replace(".py", "")
    # In a real app, we'd parse the file to find the Env ID or Class
    # For now, we just load it and acknowledge.
    env_manager.register_custom_env(file_path, module_name, "CustomEnv-v0")
    
    return {"status": "uploaded", "filename": file.filename}

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

from app.rl.sb3_service import sb3_service

class TrainRequest(BaseModel):
    env_id: str
    algo: str = "PPO"
    timesteps: int = 10000

@router.post("/train")
def train_agent(request: TrainRequest):
    session_id = sb3_service.train(request.env_id, request.algo, request.timesteps)
    return {"session_id": session_id, "status": "started"}

@router.get("/train/{session_id}")
def get_training_status(session_id: str):
    status = sb3_service.get_status(session_id)
    if not status:
        raise HTTPException(status_code=404, detail="Session not found")
    return status
